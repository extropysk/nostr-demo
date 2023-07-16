import { ErrorHandler } from '@/components/core/error-handler'
import { Form } from '@/components/core/form'
import { RecentSales } from '@/components/core/recent-sales'
import { useComments } from '@/hooks/comments'

function App() {
  const { data, publish, error, loading } = useComments({
    // customBase: 'note1me3fm8wgnkrs2tah2cl33ve3t664e7wumqu2xexmjc3uuacynwhqaj6gdu',
  })

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-sm space-y-2">
        <Form onSubmit={publish} disabled={loading} />
        <ErrorHandler error={error} />
        <div className="space-y-4">
          {data.map((event) => (
            <RecentSales key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
