import { asyncWrapper } from '../lib/asyncWrapper.js'
import { StatusCodes } from 'http-status-codes'
import { saveFileUpload } from '../utils/saveFileUpload.js'
import { deleteAllFiles, deleteSingleFile } from '../utils/file.js'
import fs from 'node:fs'
import { paginate } from '../utils/pagination.js'
import { getFileHistory } from '../utils/getFileHistory.js'
import { conn } from '../connectToDatabase/connect.js'
import { UnauthenticateError, NotFoundError, BadRequestError } from '../errors/index.js'
import halson from 'halson'

const getFiles = asyncWrapper(async (req, res) => {
    let { docs, numOfPages, hasNext, hasPrev } = await paginate(
        {
            req,
            model: 'File',
            contentPerPage: 9,
            projection: { originalName: 1, userId: 1, fileSize: 1 }
        }
    )

    docs = docs.map(file => {
        const resource = halson({ ...file })
            .addLink('self', { href: '/files?page=<insert-page-number>' })
            .addLink('file_info', { href: `/files/${file._id}` })
            .addLink('download_url', { href: `/files/downloads/${file._id}`, MethodAllowed: 'POST' })
            .addLink('author', { href: `/users/${file.userId}` })

        return resource
    })
    res.status(StatusCodes.OK).json({ data: docs, count: docs.length, numOfPages, hasNext, hasPrev })
})


const getSingleFile = asyncWrapper(async (req, res) => {

    const { _id } = req.user
    const { fileId } = req.params


    const File = conn.model('File')
    const file = await File.findOne({ userId: _id, _id: fileId })
        .select({ '__v': 0, })
        .lean()

    if (!file) throw new BadRequestError(`The requsted resource could notbe found.`)

    const resource = halson({ ...file })
        .addLink('self', { href: `/files/${file._id}` })
        .addLink('download_url', { href: `/files/downloads/${file._id}`, MethodAllowed: 'POST' })
        .addLink('author', { href: `/users/${file.userId}` })

    res.status(StatusCodes.OK).json({ data: resource })



})

const uploadFile = asyncWrapper(async (req, res) => {
    if (!req.files) {
        throw new BadRequestError(`Please select a file to upload`)
    }

    await saveFileUpload(req, req.files)

    return res.status(StatusCodes.OK).json({ status: 'success', msg: 'file upload successful.' })

})

const deleteFile = asyncWrapper(async (req, res) => {
    await deleteSingleFile(req)
    res.status(StatusCodes.OK).json({ status: "success", msg: 'file delete successful.' })
})

const deleteFiles = asyncWrapper(async (req, res) => {
    await deleteAllFiles(req)
    res.status(StatusCodes.OK).json({ status: 'success', msg: 'files deleted successfully.' })
})

const fileHistory = asyncWrapper(async (req, res) => {
    let { docs, numOfPages, hasNext, hasPrev } = await getFileHistory(req)

    docs = docs.map(file => {
        const resource = halson({ ...file })
            .addLink('self', { href: '/files/history?page=<insert-page-number>' })
            .addLink('author', { href: `/users/${file.userId}` })

        return resource
    })
    res.json({ data: docs, count: fileHistory.length, numOfPages, hasNext, hasPrev })
})


const downloadFile = asyncWrapper(async (req, res) => {
    const { fileId } = req.params
    const { _id } = req.user
    const File = conn.model('File')
    const FileAuth = conn.model('FileAuth')
    const file = await File.findOne({ _id: fileId })

    if (!file) throw new BadRequestError(`The requested resource is not available.`)

    if (!fs.existsSync(file.filePath)) throw new BadRequestError(`The requested resource is not available.`)

    const isLocked = file.isLocked

    if (isLocked && !req.body.password) {
        throw new BadRequestError(`Password field is required.`)
    }

    if (file) {
        if (isLocked) {
            const fileAuth = await FileAuth.findOne({ userId: _id })
            const { password } = req.body
            const isPasswordCorrect = await fileAuth.isPasswordCorrect(password)
            if (!isPasswordCorrect) {
                throw new UnauthenticateError(`Password incorrect`)
            } else {
                return res.download(file.filePath, file.originalName, (err) => {
                    deleteAfterDownload(err, req, file)
                })
            }
        } else {
            return res.download(file.filePath, file.originalName, (err) => {
                deleteAfterDownload(err, req, file)
            })
        }

    } else {
        throw new NotFoundError('file does not exist.')
    }
})


function deleteAfterDownload(err, req, file) {
    if (err) {
        throw err
    } else {
        fs.unlink(file.filePath, (err) => {
            if (err) throw err
            else {
                deleteSingleFile(req)
            }
        })
    }
}


export { uploadFile, deleteFile, fileHistory, deleteFiles, downloadFile, getFiles, getSingleFile }