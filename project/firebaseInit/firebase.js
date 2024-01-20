import { dirname, join, resolve, relative } from 'node:path/posix'
import { fileURLToPath } from 'node:url'
import { config } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import dotenv from "dotenv"
dotenv.config()
import admin from 'firebase-admin'


// let path = join(__dirname, "firebaseCredentials", "airfile-93a23-firebase-adminsdk-bqt9v-5193bf7cfd.json")
// const config = JSON.parse(fs.readFileSync(path, "utf-8"))

//storage bucket.
let bucket;

//initialize firebase.
function initializeFirebase() {
    admin.initializeApp({
        credential: admin.credential.cert(config),
        storageBucket: process.env.STORAGE_BUCKET
    });

    bucket = admin.storage().bucket();
}


//upload file to firebase.
async function uploadFile(filename, filepath) {
    await bucket.upload(filepath, {
        gzip: true,
        destination: filename,
        metadata: {
            cacheControl: 'public, max-age=31536000'
        }
    });
}

//firebase entry function.
async function uploadFileToFirebase({ filename, filepath }) {
    uploadFile(filename, filepath)
}

//download file from firebase.
async function downloadFileFromFirebase({ filename }) {
    const options = {
        destination: filename
    };

    // Downloads the file
    await bucket.file(filename).download(options)
}

async function deleteFileFromFirebase({ filename }) {
    await bucket.file(filename).delete()
}

initializeFirebase()

export {
    uploadFileToFirebase,
    downloadFileFromFirebase,
    deleteFileFromFirebase
}