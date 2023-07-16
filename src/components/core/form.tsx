import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNostr } from '@/hooks/nostr'
import { useState } from 'react'

type Props = {
  onSubmit: (content: string) => void
  disabled?: boolean
}

export function Form({ onSubmit, disabled }: Props) {
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
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="comment"
          onChange={(event) => setContent(event.target.value)}
          value={content}
          disabled={disabled || !publicKey}
        />
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
