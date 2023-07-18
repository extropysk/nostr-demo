import { useBaseTag } from '@/hooks/base-tag'
import { useEvent } from '@/hooks/event'
import { useEvents } from '@/hooks/events'
import { db } from '@/utils/db'
import { Event } from 'nostr-tools'

type Options = {
  owner?: string
  customBase?: string
}

export const useComments = ({ owner, customBase }: Options = {}) => {
  const baseTag = useBaseTag(owner, customBase)
  const { data } = useEvents(baseTag?.filter)
  const { publish, error, loading } = useEvent()

  const handlePublish = (content: string) => {
    if (!baseTag?.reference) {
      return
    }

    publish({
      content,
      tags: [baseTag.reference],
      kind: 1,
    })
  }

  const del = (event: Event) => {
    const tags = [
      ['e', event.id],
      ['a', `${event.kind}:${event.pubkey}:${event.id}`],
    ]

    const content = `delete event ${event.id}`
    publish({
      content,
      tags,
      kind: 5,
      onSuccess: () => db.events.delete(event.id),
    })
  }

  return { data: data ?? [], publish: handlePublish, error, loading, del }
}
