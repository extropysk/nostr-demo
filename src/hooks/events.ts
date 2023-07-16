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

    const f = {
      ...filter,
      since,
    }
    console.log('sub', f)
    const sub = pool.sub(relays, [f])

    sub.on('event', async (event) => {
      await db.events.put(event)
    })

    return () => {
      sub.unsub()
    }
  }, [filter, pool, relays, since])

  return { data }
}
