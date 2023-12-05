import express from 'express'
import { getSingleUser, getUsers } from "../controllers/user.js";

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getSingleUser)

export { router }
