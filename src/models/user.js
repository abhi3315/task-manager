const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Provide a valid email!')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age should be positive!')
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Provide a strong password!')
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
})

//hide private data
userSchema.methods.toJSON = function () {
    const userObj = this.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

//generate tokens
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, 'myToken')
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

//find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error('No user found with this email!')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Incorrect password!')

    return user
}

//hashing the password
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User