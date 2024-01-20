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

    const res = await bcrypt.compare(stringifiedPassword, this.filePassword)
    console.log(res)
    return res
}


fileAuthSchema.pre('save', async function () {
    console.log(`in fileAuth pre-save this.filePassword: `, this.filePassword)
    if (this.isModified('filePassword')) {
        const salt = await bcrypt.genSalt(10)
        this.filePassword = await bcrypt.hash(this.filePassword, salt)
    } else {
        return
    }

})
export { fileAuthSchema }