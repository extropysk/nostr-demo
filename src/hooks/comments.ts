import { Error, ErrorCode } from '@/enums/error-code'
import { useBaseTag } from '@/hooks/base-tag'
import { useNostr } from '@/hooks/nostr'
import { insertEventIntoDescendingList } from '@/utils/event'
import { Event, UnsignedEvent } from 'nostr-tools'
import { useEffect, useState } from 'react'

type Options = {
  owner?: string
  customBase?: string
}

export const useComments = ({ owner, customBase }: Options = {}) => {
  const { publicKey, signEventAsync, pool, relays } = useNostr()
  const { baseTag } = useBaseTag(owner, customBase)
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)

  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (!baseTag) return

    // query for comments
    const sub = pool.sub(relays, [
      {
        ...baseTag.filter,
        kinds: [1],
      },
    ])

    sub.on('event', (event) => {
      setEvents((events) => insertEventIntoDescendingList(events, event))
    })

    return () => {
      sub.unsub()
    }
  }, [baseTag, pool, relays])

  const publish = async (comment: string) => {
    if (!baseTag) {
      setError({ code: ErrorCode.InitializationFailed, message: 'Initialization failed' })
      return
    }

    if (!publicKey) {
      setError({ code: ErrorCode.PublicKeyNotFound, message: 'Please login' })
      return
    }

    setLoading(true)
    setError(undefined)

    const rootReference = baseTag.reference

    const unsignedEvent: UnsignedEvent = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [rootReference],
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

  return { publish, events, error, loading }
}
