import App from '@/App'
import { NostrProvider } from '@/hooks/nostr'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NostrProvider>
      <App />
    </NostrProvider>
  </React.StrictMode>
)
