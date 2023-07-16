import { useNostr } from '@/hooks/nostr'
import { db } from '@/utils/db'
import { useEffect, useState } from 'react'

export type Metadata = Record<string, string>

export const useMetadata = (pubkey: string) => {
  const { pool, relays } = useNostr()
  const [data, setData] = useState<Metadata>()

  useEffect(() => {
    const fetch = async () => {
      let event = await db.events.where({ kind: 0, pubkey }).first()
      if (!event || Date.now() / 1000 - event.created_at > 3600) {
        const e = await pool.get(relays, { kinds: [0], authors: [pubkey] })
        if (e) {
          await db.events.put(e)
          event = e
        }
      }

      if (event) {
        setData(JSON.parse(event.content))
      }
    }

    fetch()
  }, [pool, pubkey, relays])

  return { data }
}
