import mongoose from 'mongoose'

const errorHandler = (err, req, res, next) => {
    const obj = {
        msg: err.message ?? `Something went wrong, try again later.`,
        status: err.errorCode ?? 500
    }

    if (err.name === "ValidationError") {
        obj.msg = Object.values(err.errors).map(item => item.message).join(',')
    }

    res.status(obj.status).json({ msg: obj.msg })
}

export { errorHandler }