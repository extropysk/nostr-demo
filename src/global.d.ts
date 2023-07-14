import { Event, UnsignedEvent } from 'nostr-tools'

export {}

type Nostr = {
  signEvent: (event: UnsignedEvent) => Promise<Event>
  getPublicKey: () => Promise<string>
}

declare global {
  interface Window {
    nostr: Nostr
  }
}
