import express from 'express'
import { deleteFile, fileHistory, deleteFiles, getFiles, getSingleFile } from '../controllers/fileController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

const router = express.Router()

router.get('/', getFiles)
router.delete('/', isAuthenticated, deleteFiles)
router.get('/:fileId',isAuthenticated, getSingleFile)
router.delete('/:fileId', isAuthenticated, deleteFile)
router.get('/history',  fileHistory)


export { router }
