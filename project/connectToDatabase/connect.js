import { dirname, join } from 'node:path/posix'
import { fileURLToPath } from 'node:url'
import dotenv from "dotenv"
dotenv.config()
import mongoose from 'mongoose'
import { fileHistorySchema } from '../models/fileHistorySchema.js'
import { fileSchema } from '../models/fileSchema.js'
import { userAuthSchema } from '../models/userAuthSchema.js'
import { fileAuthSchema } from '../models/fileAuthSchema.js'
import { userSchema } from '../models/userSchema.js'
const connectionString = process.env.MONGO_URI

async function initDatabase(url) {
    const conn = mongoose.createConnection(url, { maxPoolSize: 10, minPoolSize: 5 })
    const FileHistory = conn.model('FileHistory', fileHistorySchema)
    const File = conn.model('File', fileSchema)
    const FileAuth = conn.model('FileAuth', fileAuthSchema)
    const UserAuth = conn.model('UserAuth', userAuthSchema)
    const User = conn.model('User', userSchema)

    return conn

}
const conn = await initDatabase(connectionString)
export { conn }
