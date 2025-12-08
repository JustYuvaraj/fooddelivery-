import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Polyfill global object for sockjs-client
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


