import { ErrorHandler } from '@/components/comment/error-handler'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Error } from '@/enums/error-code'
import { useNostr } from '@/hooks/nostr'
import { useState } from 'react'

type Props = {
  onSubmit: (content: string) => void
  disabled?: boolean
  error?: Error
}

export function Form({ onSubmit, disabled, error }: Props) {
  const [content, setContent] = useState('')
  const { publicKey, establishNostrKey } = useNostr()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!content) {
      return
    }

    onSubmit(content)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="comment"
        onChange={(event) => setContent(event.target.value)}
        value={content}
        disabled={disabled}
      />
      <div className="flex justify-between items-center">
        <ErrorHandler error={error} />
        {publicKey ? (
          <Button type="submit" disabled={disabled}>
            Send
          </Button>
        ) : (
          <Button onClick={establishNostrKey}>Login</Button>
        )}
      </div>
    </form>
  )
}
