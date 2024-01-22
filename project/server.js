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
import morgan from 'morgan'
import path from 'path/posix'
import { uploadFile, downloadFile } from './controllers/fileController.js'
import { conn } from './connectToDatabase/connect.js'
import { asyncWrapper } from './lib/asyncWrapper.js'
import FirebaseStorage from "multer-firebase-storage"
import { config } from "./config.js"

if (cluster.isPrimary) {
    for (let i = 0; i < numOfCpu; ++i) {
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
    const upload = multer({
        storage: FirebaseStorage({
            bucketName: process.env.STORAGE_BUCKET,
            credentials: {
                clientEmail: config.client_email,
                privateKey: config.private_key,
                projectId: config.project_id
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

    app.get('/', asyncWrapper(async (req, res) => {
        let documentation = `<h1><a href=${process.env.DOC_LINK}> AIRFILE DOCUMENTATION </a></h1>`
        res.status(200).send(documentation)
    }))
    app.post('/files/downloads/:fileId', isAuthenticated, upload.none(), downloadFile)
    app.post('/files/uploads', isAuthenticated, fileLimitCheck, upload.array('file-upload'), uploadFile)
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


function fileLimitCheck(req, res, next) {
    let maxSize = process.env.FILE_MAX_SIZE
    if (parseInt(req.headers["content-length"], 10) > parseInt(maxSize, 10)) {
        throw new Error(`file size limit exceeded, upload file less than ${process.env.FILE_MAX_SIZE} bytes.`)
    } else {
        next()
    }
}