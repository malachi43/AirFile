import { asyncWrapper } from "../lib/asyncWrapper.js"
import { NotFoundError, BadRequestError, UnauthenticateError } from '../errors/index.js'
import { conn } from '../connectToDatabase/connect.js'
import { StatusCodes } from 'http-status-codes'
import { createToken } from "../lib/jwt.js"

const loginUser = asyncWrapper(async (req, res) => {
    const { email, password } = req.body

    if (!(email || password)) {
        throw new BadRequestError('All fields must be provided.')
    }

    const User = conn.model('User')
    const UserAuth = conn.model('UserAuth')

    const user = await User.findOne({ email })

    if (!user) {
        throw new UnauthenticateError("No user found.")
    }

    const userAuth = await UserAuth.findOne({ userId: user._id })

    if (!userAuth) throw new UnauthenticateError('No user found.')

    const isValidPassword = await userAuth.isPasswordCorrect(password)

    if (isValidPassword) {
        req.session.user = user
        req.session.isLoggedIn = true
        res.status(StatusCodes.OK).json({ user })
    } else {
        throw new UnauthenticateError("Invalid credentials.")
    }


})

const registerUser = asyncWrapper(async (req, res) => {

    const User = conn.model('User')
    const UserAuth = conn.model('UserAuth')

    const {
        username, email, password, confirm_password
    } = req.body


    if (!(username || email || password || confirm_password)) {
        throw new BadRequestError("All fields must be provided.")
    }

    const user = await User.findOne({ email })

    if (user) {
        throw new BadRequestError('User already exists.')
    }

    if (password !== confirm_password) {
        throw new BadRequestError('password mismatch.')
    }

    const newUser = new User({ username, email })
    await newUser.save()
    const userAuth = new UserAuth({ userId: newUser._id, password })
    await userAuth.save()
    res.status(StatusCodes.CREATED).json({ user: newUser })
})

const getLoginPage = asyncWrapper(async (req, res) => {
    res.render('user/login')

})

const getRegisterPage = asyncWrapper(async (req, res) => {
    res.render('user/register')
})

const logoutUser = asyncWrapper(async (req, res) => {
    req.session.destroy(function (err) {
        if (err) throw err
        res.end(`You successfully logout.`)
    })
})


export { loginUser, registerUser, getLoginPage, getRegisterPage, logoutUser }