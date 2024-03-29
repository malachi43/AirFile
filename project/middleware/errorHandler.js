import mongoose from 'mongoose'

const errorHandler = (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(401).json({ msg: "file size limit exceeded." })
    }
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