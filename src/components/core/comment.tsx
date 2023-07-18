import { Menu } from '@/components/core/menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMetadata } from '@/hooks/metadata'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Event, nip19 } from 'nostr-tools'
dayjs.extend(relativeTime)

type Props = {
  event: Event
  onDelete: (event: Event) => void
  isDisabled: (event: Event) => boolean
}

export function formatName(pubkey: string, meta?: Record<string, string>) {
  if (meta) {
    if (meta.nip05) {
      if (meta.nip05.startsWith('_@')) return meta.nip05.slice(2)
      return meta.nip05
    }
    if (meta.name && meta.name.length) return meta.name
  }

  const npub = nip19.npubEncode(pubkey)
  return `${npub.slice(0, 6)}…${npub.slice(-3)}`
}

export function Comment({ event, onDelete, isDisabled }: Props) {
  const { data } = useMetadata(event.pubkey)

  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src={data?.picture} alt="Avatar" />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1 w-full">
        <p className="text-sm font-medium leading-none">{event.content}</p>
        <div className="text-sm text-muted-foreground">
          <span className="mr-2">{formatName(event.pubkey, data)}</span>
          <span>{dayjs(event.created_at * 1000).from(new Date())}</span>
        </div>
      </div>
      <Menu onDelete={() => onDelete(event)} disabled={isDisabled(event)} />
    </div>
  )
}