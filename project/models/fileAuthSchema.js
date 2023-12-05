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
    console.log(passwordSubmitted)
    let stringifiedPassword = String(passwordSubmitted)
    console.log(`this.password: `, this.filePassword)
    return await bcrypt.compare(stringifiedPassword, this.filePassword)
}


fileAuthSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.filePassword = await bcrypt.hash(this.filePassword, salt)
})
export { fileAuthSchema }