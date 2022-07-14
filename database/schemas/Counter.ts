import { Schema } from 'mongoose'
import connection from '../mongoose'


interface CounterSchema {
  _id: string
  __v: number
  id: string
  seq: number
}

const counterSchema = new Schema<CounterSchema>({
  _id: String,
  seq: {
    type: Number,
    default: 0
  }
})

const Counter = connection.model<CounterSchema>('Counter', counterSchema)

export default Counter
