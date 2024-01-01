import { conn } from "../connectToDatabase/connect.js"
import { deleteFileFromFirebase } from '../firebaseInit/firebase.js'

const deleteAllFiles = async (req) => {
    try {
        const { _id } = req.user

        const File = conn.model('File')
        const FileHistory = conn.model('FileHistory')
        const FileAuth = conn.model('FileAuth')

        const files = await File.find({ userId: _id })

        files.length > 0 && files.forEach(async (file, index) => {

            await deleteFileFromFirebase({ filename: file.fileName })

            await File.deleteOne({ userId: _id })
            await FileHistory.deleteOne({ userId: _id })
            await FileAuth.deleteOne({ userId: _id })
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

        await deleteFileFromFirebase({ filename: file.fileName })

        await File.deleteOne({ fileName: file.fileName, userId: _id })
        await FileHistory.deleteOne({ 'metadata.fileName': file.fileName, userId: _id })
        await FileAuth.deleteOne({ 'metadata.fileName': file.fileName, userId: _id })
    } catch (error) {
        throw error
    }
}


export { deleteAllFiles, deleteSingleFile }