import { conn } from "../connectToDatabase/connect.js"
import { deleteAsync } from "del"
import fs from 'fs'
// import nodeFs from 'node:fs'
// import fsCyclic from '@cyclic.sh/s3fs'
// const s3 = fsCyclic(process.env.CYCLIC_BUCKET_NAME)
// const fs = process.env.NODE_ENV === "production" ? s3 : nodeFs

const deleteAllFiles = async (req) => {
    try {
        const { _id } = req.user

        const File = conn.model('File')
        const FileHistory = conn.model('FileHistory')
        const FileAuth = conn.model('FileAuth')

        const files = await File.find({ userId: _id })

        files.length > 0 && files.forEach(async (file, index) => {

            if (files) {
                if (fs.existsSync(process.env.UPLOAD_FOLDER)) {
                    await deleteAsync([`${file.filePath}`])
                    await File.deleteOne({ userId: _id })
                    await FileHistory.deleteOne({ userId: _id })
                    await FileAuth.deleteOne({ userId: _id })
                }
            } else {
                throw new Error(`No file with that id.`)
            }
        })
    } catch (error) {
        throw error
    }

}



const deleteSingleFile = async (req) => {
    try {
        const { _id } = req.user
        const { fileId } = req.params
        const File = conn.model('File')
        const FileHistory = conn.model('FileHistory')
        const FileAuth = conn.model('FileAuth')

        const file = await File.findOne({ userId: _id, _id: fileId })

        if (file) {
            if (fs.existsSync(process.env.UPLOAD_FOLDER)) {
                await deleteAsync([`${file.filePath}`])
                await File.deleteOne({ fileName: file.fileName, userId: _id })
                await FileHistory.deleteOne({ 'metadata.fileName': file.fileName, userId: _id })
                await FileAuth.deleteOne({ 'metadata.fileName': file.fileName, userId: _id })
            }
        } else {
            throw new Error(`No file with that id.`)
        }
    } catch (error) {
        throw error
    }

}


export { deleteAllFiles, deleteSingleFile }