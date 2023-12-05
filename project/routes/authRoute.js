import express from 'express'
import { loginUser, registerUser, getLoginPage, getRegisterPage, logoutUser } from '../controllers/authController.js'
const router = express.Router()


// router.get('/login', getLoginPage)

// router.get('/register', getRegisterPage)

router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/logout', logoutUser)

export { router }