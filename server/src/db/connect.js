import mongoose from 'mongoose'

export async function connectDb({ mongoUri }) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  return mongoose.connection
}
