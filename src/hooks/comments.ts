import { useBaseTag } from '@/hooks/base-tag'
import { useEvent } from '@/hooks/event'
import { useEvents } from '@/hooks/events'

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

    publish(content, [baseTag.reference], 1)
  }

  return { data: data ?? [], publish: handlePublish, error, loading }
}
