import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

// We don't need to import the ensureDirectories function on the client side
// It will only be used on the server side in the API routes

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

