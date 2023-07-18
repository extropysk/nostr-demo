import { Event, UnsignedEvent, getEventHash, getSignature } from 'nostr-tools'

export function signEvent(unsignedEvent: UnsignedEvent, privateKey: string): Event {
  return {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: getSignature(unsignedEvent, privateKey),
  }
}

export function getRefs(event: Event, checkPubkey = false) {
  const refs = event.tags
    .filter((tag) => tag[0] === 'a')
    .map((a) => {
      const ref: (number | string)[] = a[1].split(':')
      ref[0] = Number(ref[0])
      return ref
    })

  if (checkPubkey) {
    return refs.filter((ref) => ref[1] === event.pubkey)
  }

  return refs
}
