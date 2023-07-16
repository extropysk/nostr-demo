import { useBaseTag } from '@/hooks/base-tag'
import { useEvent } from '@/hooks/event'
import { useEvents } from '@/hooks/events'

type Options = {
  owner?: string
  customBase?: string
}

export const useComments = ({ owner, customBase }: Options = {}) => {
  const { filter, reference } = useBaseTag(owner, customBase)
  const { data } = useEvents(filter)
  const { publish, error, loading } = useEvent()

  const handlePublish = (content: string) => {
    if (!reference) {
      return
    }

    publish(content, [reference])
  }

  return { data: data ?? [], publish: handlePublish, error, loading }
}
