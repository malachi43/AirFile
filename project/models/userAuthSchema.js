import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userAuthSchema = new mongoose.Schema({
    password: {
        type: String,
        required: [true, "password is required."]
    },
    userId: {
        type: mongoose.ObjectId,
        required: [true, "userId is required."]
    }
})


userAuthSchema.methods.isPasswordCorrect = async function (loginPassword) {
    loginPassword = String(loginPassword)
    return await bcrypt.compare(loginPassword, this.password)
}


userAuthSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
})
export { userAuthSchema }