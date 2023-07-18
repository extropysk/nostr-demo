import { Comment } from '@/components/core/comment'
import { ErrorHandler } from '@/components/core/error-handler'
import { Form } from '@/components/core/form'
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
      <div className="w-full max-w-sm space-y-2">
        <Form onSubmit={publish} disabled={loading || !publicKey} />
        <ErrorHandler error={error} />
        <div className="space-y-4">
          {data.map((event) => (
            <Comment key={event.id} event={event} onDelete={del} isDisabled={isDisabled} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
