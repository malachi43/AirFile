import { conn } from "../connectToDatabase/connect.js"
import mime from 'mime'
import slash from "slash"
import { filesize } from "filesize"
import { BadRequestError } from "../errors/badRequest.js"


const saveFileUpload = async (req, data) => {
    try {
        const { _id } = req.user
        const { password, description } = req.body

        if (data.length === 0) throw new BadRequestError(`please select a file to upload.`)

        //iterate through each file
        data.forEach(async ({ originalname, mimetype, filename, path, size }) => {

            const File = conn.model('File')
            const FileAuth = conn.model('FileAuth')
            const FileHistory = conn.model('FileHistory')

            let fileAuthObj = {}

            const fileObj = {
                userId: _id,
                fileSize: filesize(size, { base: 2, standard: "jedec" }),
                ext: mime.getExtension(mimetype),
                originalName: originalname,
                fileName: encodeURIComponent(filename.split(".")[0]),
                filePath: process.platform === "win32" ? slash(path) : path,
                dateCreated: Date.now()
            }

            if (password) {
                fileAuthObj.filePassword = password
                fileObj.isLocked = true
            }
            if (description) {
                fileObj.fileDescription = description
            }



            const newFile = new File(fileObj)
            await newFile.save()


            fileAuthObj = { ...fileAuthObj, userId: _id, metadata: newFile }
            const newFileAuth = new FileAuth(fileAuthObj)
            await newFileAuth.save()

            const fileHistory = new FileHistory({ userId: _id, metadata: newFile })
            fileHistory.createdOn = Date.now()
            await fileHistory.save()

            return
        })
    } catch (error) {
        throw error
    }


}


export { saveFileUpload }
