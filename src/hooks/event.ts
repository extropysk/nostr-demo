import { Error, ErrorCode } from '@/enums/error-code'
import { useNostr } from '@/hooks/nostr'
import { Event, Kind, UnsignedEvent } from 'nostr-tools'
import { useState } from 'react'

type Params = {
  content: string
  tags: string[][]
  kind: Kind
  onSuccess?: () => void
}

export const useEvent = () => {
  const { publicKey, signEventAsync, pool, relays } = useNostr()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(false)

  const publish = async ({ content, tags, kind, onSuccess }: Params) => {
    if (!publicKey) {
      setError({ code: ErrorCode.PublicKeyNotFound, message: 'Please login' })
      return
    }

    setLoading(true)
    setError(undefined)

    const unsignedEvent: UnsignedEvent = {
      pubkey: publicKey,
      created_at: Math.round(Date.now() / 1000),
      kind,
      tags,
      content,
    }

    let event: Event
    try {
      event = await signEventAsync(unsignedEvent)
    } catch (err) {
      console.error(err)
      setError({
        code: ErrorCode.SignEventFailed,
        message: `sign event has returned an error.`,
      })
      setLoading(false)
      return
    }

    const publishTimeout = setTimeout(() => {
      setError({
        code: ErrorCode.PublishFailed,
        message: `failed to publish event ${event.id.slice(0, 5)}… to any relay.`,
      })
      setLoading(false)
    }, 8000)

    const pub = pool.publish(relays, event)
    pub.on('ok', (relay: string) => {
      clearTimeout(publishTimeout)
      onSuccess?.()
      console.log(`event ${event.id.slice(0, 5)}… published to ${relay}.`)
      setLoading(false)
    })
    pub.on('failed', (relay: string) => {
      console.error(`failed to publish event ${event.id.slice(0, 5)}… to relay ${relay}`)
    })
  }

  return { publish, error, loading }
}
