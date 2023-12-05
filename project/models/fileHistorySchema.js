import mongoose from "mongoose";
import { fileSchema } from "./fileSchema.js";
import { timePassed } from '../lib/duration.js'

const fileHistorySchema = new mongoose.Schema({
    metadata: fileSchema.pick(["originalName", "fileDescription", "fileSize", "isLocked","fileName"]),
    createdOn: {
        type: Date,
        required: [true, "CreatedOn is required."]
    },
    userId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    }
})


fileHistorySchema.path('createdOn').get(function (v) {
    console.log(timePassed(v))
    return timePassed(v)
})

export { fileHistorySchema }
