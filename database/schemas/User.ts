import { Schema } from 'mongoose'
import { STATUS } from '../../constants'
import decode from '../../services/status/decode'
import encode from '../../services/status/encode'
import connection from '../mongoose'
import Counter from './Counter'


type Status = Record<keyof typeof STATUS, boolean>

interface UserSchema {
  _id: number
  __v: number
  id: string
  email: string
  name: string
  password: string
  fullname: string
  companyname: string
  createdAt: Date
  status: Status
}

const userSchema = new Schema<UserSchema>({
  _id: Number,
  email: {
    type: String,
    lowercase: true
  },
  name: String,
  password: String,
  fullname: String,
  companyname: String,
  createdAt: {
    type: Date,
    default: () => Date.now()
  },
  status: {
    type: Number,
    default: 0 as any,
    get: decode,
    set: function (updated: Partial<Status>) {
      const all: Status = {...(this as any).status, ...updated}
      return encode(all)
    }
  }
})

userSchema.set('toJSON', { getters: true, virtuals: true })

userSchema.pre('save', function(next) {
  if (typeof this._id === 'number') return next()
  Counter.findByIdAndUpdate(
    { _id: 'User' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
    (error, counter) => {
      if (error) return next(error)
      this._id = counter.seq
      next()
    }
  )
})

const User = connection.model<UserSchema>('User', userSchema)

export default User
export type { UserSchema, Status }
