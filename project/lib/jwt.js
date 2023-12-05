import jwt from 'jsonwebtoken'

const createToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET,{expiresIn: process.env.TOKEN_EXP})
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}


export { createToken, verifyToken }