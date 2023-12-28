import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import { fileSchema } from "./fileSchema.js";

const fileAuthSchema = new mongoose.Schema({
    filePassword: String,
    metadata: fileSchema.pick(['fileName']),
    userId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    }
})


fileAuthSchema.methods.isPasswordCorrect = async function (passwordSubmitted) {
    let stringifiedPassword = String(passwordSubmitted)
    return await bcrypt.compare(stringifiedPassword, this.filePassword)
}


fileAuthSchema.pre('save', async function () {
    if (this.filePassword) {
        const salt = await bcrypt.genSalt(10)
        this.filePassword = await bcrypt.hash(this.filePassword, salt)
    } else {
        return
    }

})
export { fileAuthSchema }