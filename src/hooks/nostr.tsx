import {
  Event,
  generatePrivateKey,
  getEventHash,
  getPublicKey,
  signEvent,
  SimplePool,
  UnsignedEvent,
} from 'nostr-tools'
import { createContext, ReactNode, useContext, useRef, useState } from 'react'

const RELAYS = ['wss://relay.damus.io']
const SK = '0704966fd2c87c5fd763ebc034f05950935c1ab919dab242691b76b4d90ae71c'

type Context = {
  publicKey?: string
  signEventAsync: (event: UnsignedEvent) => Promise<Event>
  establishNostrKey: () => Promise<void>
  pool: SimplePool
  relays: string[]
  sk: string
}

const NostrContext = createContext({} as Context)

export function NostrProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string>()
  const [privateKey, setPrivateKey] = useState<string>()

  const poolRef = useRef<SimplePool>(new SimplePool())

  async function signEventAsync(unsignedEvent: UnsignedEvent): Promise<Event> {
    // if we have a private key that means it was generated locally and we don't have a nip07 extension
    if (privateKey) {
      const event: Event = {
        ...unsignedEvent,
        id: getEventHash(unsignedEvent),
        sig: signEvent(unsignedEvent, privateKey),
      }
      return event
    } else {
      return await window.nostr.signEvent(unsignedEvent)
    }
  }

  async function establishNostrKey() {
    // check if they have a nip07 nostr extension
    if (window.nostr) {
      try {
        // and if it has a key stored on it
        setPublicKey(await window.nostr.getPublicKey())
      } catch (err) {
        console.error(err)
      }
    } else {
      // otherwise use a key from localStorage or generate a new one
      let privateKey = localStorage.getItem('nostrkey')
      if (!privateKey || privateKey.match(/^[a-f0-9]{64}$/)) {
        privateKey = generatePrivateKey()
        localStorage.setItem('nostrkey', privateKey)
      }
      setPrivateKey(privateKey)
      setPublicKey(getPublicKey(privateKey))
    }
  }

  return (
    <NostrContext.Provider
      value={{
        publicKey,
        establishNostrKey,
        signEventAsync,
        pool: poolRef.current,
        relays: RELAYS,
        sk: SK,
      }}
    >
      {children}
    </NostrContext.Provider>
  )
}

export function useNostr() {
  return useContext(NostrContext)
}
