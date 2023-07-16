import { useEvents } from '@/hooks/events'
import { useNostr } from '@/hooks/nostr'
import { BaseTag, decodeBaseTag, decodeOwner } from '@/utils/nip19'
import { signEvent } from '@/utils/nostr'
import { normalizeURL } from '@/utils/string'
import { Filter, UnsignedEvent, getPublicKey } from 'nostr-tools'
import { useEffect, useMemo, useState } from 'react'

const SK = '0704966fd2c87c5fd763ebc034f05950935c1ab919dab242691b76b4d90ae71c'

function initBaseTag(customBase?: string) {
  const baseTag = decodeBaseTag(customBase)
  if (baseTag) {
    baseTag.filter = { ...baseTag.filter, kinds: [1] }
  }
  return baseTag
}

export const useBaseTag = (owner?: string, customBase?: string) => {
  const { pool, relays } = useNostr()
  const [baseTag, setBaseTag] = useState<BaseTag | undefined>(initBaseTag(customBase))

  const url = normalizeURL(location.href)
  const filter: Filter | undefined = useMemo(() => {
    if (customBase) {
      return
    }

    return {
      '#r': [url],
      kinds: [1],
    }
  }, [url, customBase])

  const { data } = useEvents(filter)

  useEffect(() => {
    if (baseTag || !data) {
      return
    }

    if (data.length) {
      setBaseTag({
        filter: { '#e': data.map((event) => event.id), kinds: [1] },
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
        filter: { '#e': [rootEvent.id], kinds: [1] },
        reference: ['e', rootEvent.id, '', 'root'],
      })
      pool.publish(relays, rootEvent)
    }
  }, [baseTag, data, owner, pool, relays, url])

  return baseTag
}
