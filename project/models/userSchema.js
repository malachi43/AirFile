import mongoose from 'mongoose'
import pkg from 'validator'
const {isEmail} = pkg

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username field is required."],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email field is required."],
        unique: true,
        validate: [isEmail, "Invalid Email."],
        trim: true,
    }
})

// function validateEmail(email) {
//     const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
//     return re.test(email)
// }

export { userSchema }
