import { StrictMode } from 'react'
import { PageContextProvider } from './usePageContext'
import { SessionProvider } from 'next-auth/react'
import type { PageContext } from './types'


const App = ({ pageContext }: { pageContext: PageContext }) => {
  const { Page, pageProps, session, csrfToken, callbackUrl } = pageContext
  return (
    <StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <SessionProvider session={session}>
          <div suppressHydrationWarning={true}>
            <Page
              {...pageProps}
              session={session}
              csrfToken={csrfToken}
              callbackUrl={callbackUrl}
            />
          </div>
        </SessionProvider>
      </PageContextProvider>
    </StrictMode>
  )
}

export default App
