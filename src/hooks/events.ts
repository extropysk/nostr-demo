import { Error, ErrorCode } from '@/enums/error-code'
import { useNostr } from '@/hooks/nostr'
import { DbEvent, db } from '@/utils/db'
import { Filter, Tag } from '@/utils/nip19'
import { useLiveQuery } from 'dexie-react-hooks'
import { Event, UnsignedEvent } from 'nostr-tools'
import { useEffect, useState } from 'react'

const filterEvents = (event: DbEvent, filter: Filter) => {
  let predicate = true

  if (filter.ids) {
    predicate &&= filter.ids.includes(event.id)
  }

  if (filter.authors) {
    predicate &&= filter.authors.includes(event.pubkey)
  }

  if (filter.kinds) {
    predicate &&= filter.kinds.includes(event.kind)
  }

  if (filter.since) {
    predicate &&= event.created_at > filter.since
  }

  if (filter.until) {
    predicate &&= event.created_at < filter.until
  }

  Object.keys(filter)
    .filter((key) => key.startsWith('#'))
    .forEach((tag: string) => {
      predicate &&= event.tags.some(
        (t) => t[0] === tag.substring(1) && filter[tag as Tag]?.includes(t[1])
      )
    })

  return predicate
}

export const useEvents = (filter?: Filter, reference?: string[]) => {
  const { publicKey, signEventAsync, pool, relays } = useNostr()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)
  const [since, setSince] = useState<number>()

  const events = useLiveQuery(async () => {
    if (!filter) {
      return
    }

    return await db.events
      .orderBy('created_at')
      .reverse()
      .filter((e) =>
        filterEvents(e, {
          ...filter,
          kinds: [1],
        })
      )
      .limit(filter.limit ?? 100)
      .toArray()
  }, [filter])

  useEffect(() => {
    if (events && !since) {
      const since = events[0]?.created_at ?? 1
      setSince(since)
    }
  }, [events, since])

  useEffect(() => {
    if (!filter || !since) return

    const sub = pool.sub(relays, [
      {
        ...filter,
        kinds: [1],
        since,
      },
    ])

    sub.on('event', async (event) => {
      await db.events.put(event)
    })

    return () => {
      sub.unsub()
    }
  }, [filter, pool, relays, since])

  const publish = async (comment: string) => {
    if (!reference) {
      setError({ code: ErrorCode.InitializationFailed, message: 'Initialization failed' })
      return
    }

    if (!publicKey) {
      setError({ code: ErrorCode.PublicKeyNotFound, message: 'Please login' })
      return
    }

    setLoading(true)
    setError(undefined)

    const unsignedEvent: UnsignedEvent = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [reference],
      content: comment,
    }

    let event: Event
    try {
      event = await signEventAsync(unsignedEvent)
    } catch (err) {
      console.error(err)
      setError({
        code: ErrorCode.SignEventFailed,
        message: `sign event has returned an error.`,
      })
      setLoading(false)
      return
    }

    const publishTimeout = setTimeout(() => {
      setError({
        code: ErrorCode.PublishFailed,
        message: `failed to publish event ${event.id.slice(0, 5)}… to any relay.`,
      })
      setLoading(false)
    }, 8000)

    const pub = pool.publish(relays, event)
    pub.on('ok', (relay: string) => {
      clearTimeout(publishTimeout)
      console.log(`event ${event.id.slice(0, 5)}… published to ${relay}.`)
      setLoading(false)
    })
    pub.on('failed', (relay: string) => {
      console.error(`failed to publish event ${event.id.slice(0, 5)}… to relay ${relay}`)
    })
  }

  return { publish, events: events ?? [], error, loading }
}
