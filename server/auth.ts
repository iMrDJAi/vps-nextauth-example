import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import setCookie from 'set-cookie-parser'
import fetch from 'node-fetch'
import { Router } from 'express'
import bcrypt from 'bcrypt'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getToken } from 'next-auth/jwt'
import { verificationRequest, validateToken } from '../services/email/verificationRequest'
import { validateLoginForm, validateRegistrationForm } from '../services/validation/validateForm'
import User from '../database/schemas/User'
import decode from '../services/status/decode'
import type { Session, NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Request, Response, NextFunction } from 'express'
import type { Status } from '../database/schemas/User'


type RequestHandler = (
  req: NextApiRequest & Request,
  res: NextApiResponse & Response,
  next: NextFunction,
  opts: NextAuthOptions
) => any

const uri = process.env.NEXTAUTH_URL

if (!uri) {
  throw new Error('Please add your NEXTAUTH_URL to .env')
}

const AuthError = class AuthError extends Error {}

const useSecureCookie = (uri || '').startsWith('https://')
// const sessionCookie =  (useSecureCookie ? '__Secure-' : '') + 'next-auth.session-token'
const csrfCookie = (useSecureCookie ? '__Host-' : '') + 'next-auth.csrf-token'
const callbackCookie = (useSecureCookie ? '__Secure-' : '') + 'next-auth.callback-url'

const transformGetRequest = (req: NextApiRequest & Request) => {
  const csrfToken = (req.cookies[csrfCookie] || '').split('|')[0]
  req.method = 'POST'
  req.body = {
    ...req.query,
    redirect: 'true',
    json: 'false',
    csrfToken
  }
}

const handleRequest: RequestHandler = async (req, res, next, opts) => {
  if (req.method !== 'POST' && req.method !== 'GET') return next()
  const action = req.path.split('/').slice(2)
  if (action[0] === 'callback') {
    const sessionToken = await getToken({ req })
    const needsLogin = ['verify-email'/*, 'otp' */].includes(action[1])
    if (req.method === 'GET') transformGetRequest(req)
    req.body.sessionToken = sessionToken ? JSON.stringify(sessionToken) : undefined
    if (needsLogin && !sessionToken) return res.redirect(307, '/login')
    if (!needsLogin && sessionToken) return res.status(403).send('Already logged-in')
  }
  req.query.nextauth = action
  NextAuth(req, res, opts)
}

const exposeSession: RequestHandler = async (req, res, next) => {
  // Fetch session
  const options = req.headers.cookie ? { headers: { cookie: req.headers.cookie } } : {}
  const sessionRes = await fetch(`${uri}/session`, options)
  const session: Session = await sessionRes.json()
  // Pass session to next()
  res.locals.session = session
  // Include set-cookie in response
  const cookies = sessionRes.headers.raw()['set-cookie'] || []
  res.setHeader('Set-Cookie', cookies)
  // Parse set-cookie
  const parsed = setCookie.parse(cookies, { map: true })
  // Pass csrfToken to next()
  const csrfToken: string = (parsed[csrfCookie] || {}).value || req.cookies[csrfCookie]
  res.locals.csrfToken = csrfToken.split('|')[0]
  // Pass callbackUrl to next()
  const callbackUrl: string = (parsed[callbackCookie] || {}).value || req.cookies[callbackCookie]
  res.locals.callbackUrl = callbackUrl
  next()
}

/** Compatibility layer for `next-auth` for `express` apps.  */
function createNextAuthMiddleware(options: NextAuthOptions) {
  return Router()
    .use(urlencoded({ extended: false }))
    .use(json())
    .use(cookieParser())
    .get(/^\/auth\/(csrf|session)$/, (...args) => (handleRequest as any)(...args, options))
    .post(/^\/auth\/callback\/(register|login)$/, (...args) => (handleRequest as any)(...args, options))
    .get(/^\/auth\/callback\/(verify-email)$/, (...args) => (handleRequest as any)(...args, options))
    .post(/^\/auth\/signout$/, (...args) => (handleRequest as any)(...args, options))
    .all('*', (...args) => (exposeSession as any)(...args, options))
}

const nextAuthOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  },
  providers: [
    CredentialsProvider({
      id: 'register',
      credentials: {
        email: {}, username: {}, password: {}, password2: {},  fullname: {}, companyname: {}
      },
      async authorize(form = {} as any) {
        const formErrors = validateRegistrationForm(form)
        const { email, username: name, password, ...rest } = form
        try {
          if (Object.keys(formErrors).length) {
            throw new AuthError(JSON.stringify(formErrors))
          }
          if (await User.exists({ name }).collation({ locale: 'en', strength: 2 })) {
            formErrors.username = 'USERNAME_TAKEN'
            throw new AuthError(JSON.stringify(formErrors))
          }
          if (await User.exists({ email })) {
            formErrors.email = 'EMAIL_IN_USE'
            throw new AuthError(JSON.stringify(formErrors))
          }
          const hashedPassword = await bcrypt.hash(password, 10)
          const user = await User.create({ email, name, password: hashedPassword, ...rest })
          try {
            await verificationRequest(user.id, user.email)
          } catch {/* ignore that error */}
          return user
        } catch(err) {
          if (err instanceof AuthError) throw err
          formErrors.form = 'SOMETHING_WENT_WRONG'
          throw new Error(JSON.stringify(formErrors))
        }
      }
    }),
    CredentialsProvider({
      id: 'login',
      credentials: {
        username: {}, password: {}
      },
      async authorize(form = {} as any) {
        const formErrors = validateLoginForm(form)
        const { username: name, password } = form
        try {
          if (Object.keys(formErrors).length) {
            throw new AuthError(JSON.stringify(formErrors))
          }
          const user = await User.findOne({ name }).collation({ locale: 'en', strength: 2 })
          if (!user) {
            formErrors.username = 'INCORRECT_USERNAME'
            throw new AuthError(JSON.stringify(formErrors))
          }
          if (!await bcrypt.compare(password, user.password)) {
            formErrors.password = 'INCORRECT_PASSWORD'
            throw new AuthError(JSON.stringify(formErrors))
          }
          return user
        } catch(err) {
          if (err instanceof AuthError) throw err
          console.error(err)
          formErrors.form = 'SOMETHING_WENT_WRONG'
          throw new Error(JSON.stringify(formErrors))
        }
      }
    }),
    CredentialsProvider({
      id: 'verify-email',
      credentials: {
        token: {}, sessionToken: {}
      },
      async authorize(form = {} as any) {
        const token = form.token
        const sessionToken: JWT = JSON.parse(form.sessionToken)
        const status = decode(sessionToken.status!)
        if (status.EMAIL_VERIFIED) throw new AuthError()
        const isValid = await validateToken(token, sessionToken)
        if (!isValid) throw new AuthError()
        try {
          const user = (await User.findById(sessionToken.sub))!
          user.status = { EMAIL_VERIFIED: true } as Status
          await user.save()
          return user
        } catch {
          throw new AuthError()
        }
      }
    })
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        const status: number = user.get('status', null, { getters: false })
        token.status = status
      }
      return token
    },
    async session({session, token}) {
      session.user.status = decode(token.status!)
      session.user.id = token.sub!
      return session
    }
  }
}

const NextAuthMiddleware = createNextAuthMiddleware(nextAuthOptions)

export { createNextAuthMiddleware, nextAuthOptions, NextAuthMiddleware }
