import React from 'react'
import ReactDOM from 'react-dom/client'
import RootApp from './RootApp'
import './styles/index.css'

// Polyfill global object for sockjs-client
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
)


