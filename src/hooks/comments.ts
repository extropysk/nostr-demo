import { useBaseTag } from '@/hooks/base-tag'
import { useEvents } from '@/hooks/events'

type Options = {
  owner?: string
  customBase?: string
}

export const useComments = ({ owner, customBase }: Options = {}) => {
  const { filter, reference } = useBaseTag(owner, customBase)

  return useEvents(filter, reference)
}
