import mongoose from 'mongoose'
import { client } from './mongodb'


const connection = mongoose.createConnection().setClient(client)

export default connection
