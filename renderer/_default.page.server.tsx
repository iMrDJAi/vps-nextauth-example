import logoUrl from './logo.svg'
import styleUrl from './index.scss?url'
import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import App from './App'
import type { PageContext } from './types'


async function onBeforeRender(pageContext: PageContext) {
  const user = pageContext.session.user
  let redirectTo: string|undefined

  switch (true as boolean) {
  case !user:
    redirectTo = '/login'
    break
  case !user.status.EMAIL_VERIFIED:
    redirectTo = '/register/verify-email'
    break
  default:
    redirectTo = undefined
    break
  }

  return {
    pageContext: {
      redirectTo
    }
  }
}

async function render(pageContext: PageContext) {
  const { redirectTo, exports } = pageContext
  if (redirectTo) return {
    pageContext: { redirectTo }
  }

  const pageHtml = ReactDOMServer.renderToString(
    <App pageContext={pageContext} />
  )

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = exports
  const title = (documentProps && documentProps.title) || 'Title'
  const desc = (documentProps && documentProps.description) || 'Description'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        ${dangerouslySkipEscape(styleUrl ? `<link rel="stylesheet" href="${styleUrl}" />` : '')}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`

  // Pass `pageContext` back to `server/index.ts`
  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection
      // See https://vite-plugin-ssr.com/page-redirection
    }
  }
}

// These props of pageContext will be passed to the browser
// See https://vite-plugin-ssr.com/data-fetching
const passToClient = ['pageProps', 'urlPathname', 'session', 'csrfToken', 'callbackUrl']

export { render, onBeforeRender, passToClient }
