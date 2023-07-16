import { useNostr } from '@/hooks/nostr'
import { DbEvent, db } from '@/utils/db'
import { Filter, Tag } from '@/utils/nip19'
import { useLiveQuery } from 'dexie-react-hooks'
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

export const useEvents = (filter?: Filter) => {
  const { pool, relays } = useNostr()
  const [since, setSince] = useState<number>()

  const data = useLiveQuery(async () => {
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
    if (data && !since) {
      const since = data[0]?.created_at ?? 1
      setSince(since)
    }
  }, [data, since])

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

  return { data }
}
