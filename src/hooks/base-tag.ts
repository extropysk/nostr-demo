import { useNostr } from '@/hooks/nostr'
import { useDidMount } from '@/hooks/useDidMount'
import { decodeBaseTag, decodeOwner } from '@/utils/nip19'
import { normalizeURL } from '@/utils/string'
import { Event, UnsignedEvent, getEventHash, getPublicKey, signEvent } from 'nostr-tools'
import { useState } from 'react'

export const useBaseTag = (owner?: string, customBase?: string) => {
  const { pool, relays, sk } = useNostr()

  const [baseTag, setBaseTag] = useState(decodeBaseTag(customBase))

  useDidMount(async () => {
    if (baseTag) {
      return
    }
    const url = normalizeURL(location.href)

    // search for the base event based on the #r tag (url)
    pool
      .list(relays, [
        {
          '#r': [url],
          kinds: [1],
        },
      ])
      .then((events) => {
        if (events.length === 0) {
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
          const reference = ['e', rootEvent.id, '', 'root']
          setBaseTag({ filter: { '#e': [rootEvent.id] }, reference })

          pool.publish(relays, rootEvent)
          //   setBaseTag((prev) => {
          //     reference[2] = pool.seenOn(root.id)[0]

          //     return {
          //       filter: { '#e': [root.id] },
          //       reference: reference,
          //     }
          //   })
        } else {
          setBaseTag({
            filter: { '#e': events.slice(0, 3).map((event) => event.id) },
            reference: ['e', events[0].id, pool.seenOn(events[0].id)[0], 'root'],
          })
        }
      })
  })

  return { baseTag }
}
