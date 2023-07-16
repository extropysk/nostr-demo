import { useEvents } from '@/hooks/events'
import { useNostr } from '@/hooks/nostr'
import { BaseTag, decodeBaseTag, decodeOwner } from '@/utils/nip19'
import { normalizeURL } from '@/utils/string'
import { Event, UnsignedEvent, getEventHash, getPublicKey, signEvent } from 'nostr-tools'
import { useEffect, useMemo, useState } from 'react'

export const useBaseTag = (owner?: string, customBase?: string) => {
  const { pool, sk, relays } = useNostr()

  const [baseTag, setBaseTag] = useState<BaseTag>(decodeBaseTag(customBase))

  const url = normalizeURL(location.href)
  const filter = useMemo(() => {
    if (customBase) {
      return
    }

    return {
      '#r': [url],
      limit: 3,
    }
  }, [url, customBase])
  const { data } = useEvents(filter)

  useEffect(() => {
    if (customBase || !data) {
      return
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
        pubkey: getPublicKey(sk),
        created_at: Math.round(Date.now() / 1000),
        kind: 1,
        tags: tags,
        content: `Comments on ${url}` + (ownerTag ? ` by #[1]` : '') + ` ↴`,
      }
      const rootEvent: Event = {
        ...unsignedRootEvent,
        id: getEventHash(unsignedRootEvent),
        sig: signEvent(unsignedRootEvent, sk),
      }
      pool.publish(relays, rootEvent)
    }
  }, [data, pool, owner, url, sk, relays, customBase])

  return baseTag
}
