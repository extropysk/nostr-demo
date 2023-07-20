import { Menu } from '@/components/comment/menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

export function Item({ event, onDelete, isDisabled }: Props) {
  const { data } = useMetadata(event.pubkey)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={data?.picture} alt="Avatar" />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 w-full">
            <p className="text-sm font-medium leading-none">{formatName(event.pubkey, data)}</p>
            <p className="text-sm text-muted-foreground">
              {dayjs(event.created_at * 1000).from(new Date())}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Menu onDelete={() => onDelete(event)} disabled={isDisabled(event)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>{event.content}</CardContent>
    </Card>
  )
}
