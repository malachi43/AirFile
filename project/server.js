import os from 'os'
import cors from 'cors'
const numOfCpu = os.availableParallelism()
import express from 'express'
import cluster from 'node:cluster'
import multer from 'multer'
import mongoose from 'mongoose'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { router as authRoute } from './routes/authRoute.js'
import { router as userRoute } from './routes/userRoute.js'
import { router as fileRoute } from './routes/fileRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { isAuthenticated } from './middleware/isAuthenticated.js'
import { mkdir } from './lib/mkdir.js'
import { v4 as uuidv4 } from "uuid"
import morgan from 'morgan'
import path from 'path/posix'
import { uploadFile, downloadFile } from './controllers/fileController.js'
import { conn } from './connectToDatabase/connect.js'
import { asyncWrapper } from './lib/asyncWrapper.js'
import FirebaseStorage from "multer-firebase-storage"
import fs from "node:fs"


if (cluster.isPrimary) {
    // for (let i = 0; i < numOfCpu; ++i) {
    //     cluster.fork()
    // }

    for (let i = 0; i < 1; ++i) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`process ${worker.process.pid} exited with code: ${code}`)
        cluster.fork()
    })
} else {
    const app = express()
    const PORT = 5000
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    app.use(cors())
    app.use(express.static(path.join(__dirname, 'public')))

    //middlewares
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    //ejs configuration.
    // app.set('view engine', 'ejs')
    // app.set('views', join(__dirname, "views"))

    //location to store file 
    // const storage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //         const folder = process.env.UPLOAD_FOLDER
    //         mkdir(folder)
    //         cb(null, folder)
    //     },
    //     filename: function (req, file, cb) {
    //         const { originalname } = file
    //         cb(null, `${uuidv4()}${path.extname(originalname)}`)
    //     },
    // })



    //instantiating multer
    // const upload = multer({ storage })

    //multer for firebase
    const fileLoc = "firebaseCredentials/airfile-93a23-firebase-adminsdk-bqt9v-5193bf7cfd.json"
    const jsonFile = JSON.parse(fs.readFileSync(fileLoc, "utf-8"))
    let privateKey = jsonFile.private_key
    // console.log(`privateKey: ` ,privateKey)
    // console.log({
    //     clientEmail: jsonFile.client_email,
    //     privateKey: jsonFile.private_key,
    //     projectId: jsonFile.project_id
    // })
    const upload = multer({
        storage: FirebaseStorage({
            bucketName: process.env.STORAGE_BUCKET,
            credentials: {
                clientEmail: jsonFile.client_email,
                privateKey: jsonFile.private_key,
                projectId: jsonFile.project_id
            },
            unique: true,
            public: true
        })
    })

    const aWeek = 1000 * 60 * 60 * 24 * 7

    const sessionConfig = {
        name: 'airfile',
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false, // don't create session until something stored
        resave: false, //don't save session if unmodified
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        },
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            // touchAfter: 24 * 3600 // time period in seconds
        }),

    }
    //session configuration
    app.use(session(sessionConfig));

    app.use(asyncWrapper(async (req, res, next) => {
        if (!req.session.user) {
            next()
        } else {
            const User = conn.model('User')
            const user = await User.findById(req.session.user._id)
            req.user = user
            next()
        }
    }))

    app.disable('x-powered-by')
    app.use(morgan('dev'))

    app.use(express.static(path.join(__dirname, 'public')))
    app.post('/files/downloads/:fileId', isAuthenticated, upload.none(), downloadFile)
    app.post('/files/uploads', isAuthenticated, upload.array('file-upload'), uploadFile)
    app.use('/auth', authRoute)
    app.use('/users', isAuthenticated, userRoute)
    app.use('/files', fileRoute)


    app.use(notFound)
    app.use(errorHandler)


    startApp()

    async function startApp() {
        await mongoose.createConnection(process.env.MONGO_URI, { maxPoolSize: 10, minPoolSize: 5 })
        app.listen(PORT, () => {
            console.log(`Server is listening on :${PORT}. Press Ctrl-C to terminate.`)
        })
    }


    //To allows cors(Cross-Origin Resource Sharing)
    function setHeaders() {
        return (req, res, next) => {
            res.set({
                'Access-Control-Allow-Method': 'POST, GET, PUT, PATCH, DELETE',
                'Access-Control-Allow-Origin': '*'
            })
            next()
        }
    }

}
