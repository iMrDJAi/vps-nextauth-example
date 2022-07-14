/* eslint-disable no-var */
import type { MongoClient } from 'mongodb'


declare global {
  var _mongoClient: MongoClient
  var _mongoClientPromise: Promise<MongoClient>
}
