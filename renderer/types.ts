import type { ReactElement } from 'react'
import type { Session } from 'next-auth'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'


export type PageProps = {[key: string]: any}
// The `pageContext` that are available in both on the server-side and browser-side
export interface PageContext extends PageContextBuiltInClient {
  Page: (pageProps:  {
    session: Session
    csrfToken: string
    callbackUrl: string
  } & PageProps) => ReactElement
  pageProps: PageProps
  urlPathname: string
  redirectTo?: string
  exports: {
    documentProps?: {
      title?: string
      description?: string
    }
  }
  session: Session
  csrfToken: string
  callbackUrl: string
}
