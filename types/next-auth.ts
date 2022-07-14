/* eslint-disable @typescript-eslint/no-empty-interface */
import type { STATUS } from '../constants'
import type { DefaultSession } from 'next-auth'
import type UserModel from '../database/schemas/User'


declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      status: Record<keyof typeof STATUS, boolean>
    }
  }
  interface User extends InstanceType<typeof UserModel> {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    status?: number
  }
}
