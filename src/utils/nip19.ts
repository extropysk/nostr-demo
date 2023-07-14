import { nip19 } from 'nostr-tools'

type BaseTag = {
  filter: Record<string, string[]>
  reference: string[]
}

export const decodeOwner = (owner?: string) => {
  let ownerTag: string[] | undefined
  if (owner) {
    try {
      const { type, data } = nip19.decode(owner)
      switch (type) {
        case 'npub':
          ownerTag = ['p', data]
          break
        case 'nprofile':
          ownerTag = ['p', data.pubkey]
          if (data.relays && data.relays.length > 0) {
            ownerTag.push(data.relays[0])
          }
          break
      }
    } catch (err) {
      if (owner.match(/^[a-f0-9]{64}$/)) {
        ownerTag = ['p', owner]
      }
    }
  }
  return ownerTag
}

export const decodeBaseTag = (customBase?: string) => {
  let customBaseTag: BaseTag | undefined
  if (customBase) {
    try {
      const { type, data } = nip19.decode(customBase)
      switch (type) {
        case 'note':
          customBaseTag = {
            filter: { '#e': [data] },
            reference: ['e', data, '', 'root'],
          }
          break
        case 'nevent':
          customBaseTag = {
            filter: { '#e': [data.id] },
            reference: ['e', data.id, data.relays?.[0] || '', 'root'],
          }
          break
        case 'naddr':
          const { kind, pubkey, identifier } = data
          customBaseTag = {
            filter: { '#a': [`${kind}:${pubkey}:${identifier}`] },
            reference: ['a', `${kind}:${pubkey}:${identifier}`, data.relays?.[0] || '', 'root'],
          }
          break
      }
    } catch (err) {
      customBaseTag = {
        filter: { '#e': [customBase] },
        reference: ['e', customBase, '', 'root'],
      }
    }
  }
  return customBaseTag
}
