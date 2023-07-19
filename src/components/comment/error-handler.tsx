import { Error } from '@/enums/error-code'

type Props = {
  error?: Error
}

export function ErrorHandler({ error }: Props) {
  if (!error) {
    return <div></div>
  }
  return (
    <div className="text-sm text-destructive flex justify-between space-x-4">{error.message}</div>
  )
}
