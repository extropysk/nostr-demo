import { useNostr } from '@/hooks/nostr'
import { isNip05verified } from '@/utils/nip05'
import { useEffect, useState } from 'react'

export type Metadata = Record<string, string>

export const useMetadata = (pubkey: string) => {
  const { pool, relays } = useNostr()
  const [data, setData] = useState<Metadata>()

  useEffect(() => {
    pool.list(relays, [{ kinds: [0], authors: [pubkey] }]).then(async (res) => {
      if (res.length) {
        const meta = JSON.parse(res[0].content)
        meta.nip05verified = await isNip05verified(pubkey, meta.nip05)
        setData(meta)
      }
    })
  }, [pool, pubkey, relays])

  return { data }
}
