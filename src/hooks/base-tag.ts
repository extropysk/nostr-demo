import { useNostr } from '@/hooks/nostr'
import { db, filterEvents } from '@/utils/db'
import { BaseTag, decodeBaseTag, decodeOwner } from '@/utils/nip19'
import { signEvent } from '@/utils/nostr'
import { normalizeURL } from '@/utils/string'
import { UnsignedEvent, getPublicKey } from 'nostr-tools'
import { useEffect, useState } from 'react'

const SK = '0704966fd2c87c5fd763ebc034f05950935c1ab919dab242691b76b4d90ae71c'

export const useBaseTag = (owner?: string, customBase?: string) => {
  const { pool, relays } = useNostr()
  const [baseTag, setBaseTag] = useState<BaseTag | undefined>(decodeBaseTag(customBase))

  useEffect(() => {
    const fetch = async () => {
      const url = normalizeURL(location.href)
      const filter = {
        '#r': [url],
        kinds: [1],
      }

      let data = await db.events
        .orderBy('created_at')
        .reverse()
        .filter((e) => filterEvents(e, filter))
        .limit(100)
        .toArray()

      if (data.length === 0) {
        data = await pool.list(relays, [filter])
        await db.events.bulkPut(data)
      }

      if (data.length) {
        setBaseTag({
          filter: { '#e': data.map((event) => event.id) },
          reference: ['e', data[0].id, pool.seenOn(data[0].id)[0], 'root'],
        })
      } else {
        const ownerTag = decodeOwner(owner)
        const tags = [['r', url]]
        if (ownerTag) {
          tags.push(ownerTag)
        }
        const unsignedRootEvent: UnsignedEvent = {
          pubkey: getPublicKey(SK),
          created_at: Math.round(Date.now() / 1000),
          kind: 1,
          tags: tags,
          content: `Comments on ${url}` + (ownerTag ? ` by #[1]` : '') + ` ↴`,
        }
        const rootEvent = signEvent(unsignedRootEvent, SK)
        setBaseTag({
          filter: { '#e': [rootEvent.id] },
          reference: ['e', rootEvent.id, '', 'root'],
        })
        pool.publish(relays, rootEvent)
      }
    }

    fetch()
  }, [owner, pool, relays])

  return baseTag
}
