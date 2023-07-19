import { Form } from '@/components/comment/form'
import { Item } from '@/components/comment/item'
import { useComments } from '@/hooks/comments'
import { useNostr } from '@/hooks/nostr'
import { Event } from 'nostr-tools'

function App() {
  const { data, publish, error, loading, del } = useComments({
    // customBase: 'note1me3fm8wgnkrs2tah2cl33ve3t664e7wumqu2xexmjc3uuacynwhqaj6gdu',
  })
  const { publicKey } = useNostr()

  const isDisabled = (event: Event) => {
    return event.pubkey !== publicKey
  }

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Form onSubmit={publish} disabled={loading || !publicKey} error={error} />
        <div className="space-y-2">
          {data.map((event) => (
            <Item key={event.id} event={event} onDelete={del} isDisabled={isDisabled} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
