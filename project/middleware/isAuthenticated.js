import { asyncWrapper } from "../lib/asyncWrapper.js"
import { verifyToken } from "../lib/jwt.js"
import { UnauthenticateError } from '../errors/unauthenticate.js'

const isAuthenticated = asyncWrapper(async (req, res, next) => {
    // try {
    //     const token = req.header('authorization').split(' ')[1]
    //     const verifiedToken = verifyToken(token)
    //     req.user = verifiedToken
    //     return next()
    // } catch (error) {
    //     throw new UnauthenticateError('No authentication token provided')
    // }

    if (req.session.isLoggedIn) {
        next()
    } else {
        throw new UnauthenticateError(`Unauthorized. Please login.`)
    }

})


export { isAuthenticated }