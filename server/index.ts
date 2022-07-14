import 'dotenv/config'
import * as vite from 'vite'
import express from 'express'
import compression from 'compression'
import fetch, { Headers, Request, Response } from 'cross-fetch'
import { renderPage } from 'vite-plugin-ssr'
import { type Session } from 'next-auth'
import { PageContext } from '../renderer/types'
import { clientPromise } from '../database/mongodb'


if (!global.fetch) {
  global.fetch = fetch
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
}

(async () => {

  const isProduction = process.env.NODE_ENV === 'production'
  const root = `${__dirname}/..`
  const port = process.env.PORT || 3000

  await clientPromise
  const { NextAuthMiddleware } = await import('./auth')

  const server = express()

  server.use(compression())
  server.use(express.text()) // Parse & make HTTP request body available at `req.body`

  const viteDevServer = !isProduction ? await vite.createServer({
    root,
    server: { middlewareMode: 'ssr' }
  }) : undefined

  server.use(
    viteDevServer
      ? viteDevServer.middlewares
      : express.static(`${root}/dist/client`)
  )

  server.use(NextAuthMiddleware)

  server.get('*', async (req, res, next) => {
    const url = req.originalUrl
    const session: Session = res.locals.session || {}
    const csrfToken: string = res.locals.csrfToken
    const callbackUrl: string = res.locals.callbackUrl
    const pageContextInit = { url, session, csrfToken, callbackUrl }
    // create a new `pageContext`, add properties to it (e.g. the page that matches the `url` + its exports),
    // then pass it to `.page.server.tsx`
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      const { redirectTo } = <unknown>pageContext as PageContext & { httpResponse: null }
      if (redirectTo) res.redirect(307, redirectTo)
      return next()
    }
    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })

})()
