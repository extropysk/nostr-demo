import { useNostr } from '@/hooks/nostr'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Event } from 'nostr-tools'
import { useEffect, useMemo } from 'react'

const set = new Set()
export const useMetadata = (pubkey: string) => {
  const { pool, relays } = useNostr()

  const metadata = useLiveQuery(async () => {
    return await db.events.where({ kind: 0, pubkey }).limit(1).toArray()
  }, [pubkey])

  useEffect(() => {
    if (metadata?.length === 0 && !set.has(pubkey)) {
      set.add(pubkey)
      pool.get(relays, { kinds: [0], authors: [pubkey] }).then((event: Event) => {
        if (event) {
          db.events.put(event)
        }
      })
    }
  }, [metadata, pool, pubkey, relays])

  const data = useMemo(() => {
    if (metadata?.length) {
      return JSON.parse(metadata[0].content)
    }
  }, [metadata])

  return { data }
}
