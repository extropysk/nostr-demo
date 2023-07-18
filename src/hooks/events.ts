import { useNostr } from '@/hooks/nostr'
import { db, filterEvents } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Filter } from 'nostr-tools'
import { useEffect, useState } from 'react'

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

    const subFilter: Filter = {
      ...filter,
      kinds: [1],
      since,
    }
    console.log('sub', subFilter)
    const sub = pool.sub(relays, [subFilter])

    sub.on('event', async (event) => {
      await db.events.put(event)
    })

    return () => {
      sub.unsub()
    }
  }, [filter, pool, relays, since])

  return { data }
}
