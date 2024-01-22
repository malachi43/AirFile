import mongoose, { Schema } from 'mongoose'
import { timePassed } from '../lib/duration.js'

const fileSchema = new mongoose.Schema({
    fileSize: {
        type: String,
        required: [true, "fileSize is required."]
    },
    ext: String,
    originalName: {
        type: String,
        required: [true, "originalName is required."]
    },
    fileName: {
        type: String,
        required: [true, "fileName is required."]
    },
    filePath: {
        type: String,
        required: [true, "filePath is required."]
    },
    fileDescription: {
        type: String,
        default: ""
    },
    isLocked: {
        type: Boolean,
        required: [true, "isLocked is required."],
        default: false
    },
    dateCreated: {
        type: Date,
        required: [true, "dateCreated field is required."]
    },
    userId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    }
})

fileSchema.path('dateCreated').get(function (v) {
    return timePassed(v)
})

fileSchema.index({ fileName: 1 })
fileSchema.index({ dateCreated: -1 })
fileSchema.index({ originalName: 1 })


export { fileSchema }