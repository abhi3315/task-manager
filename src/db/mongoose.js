const mongoose = require('mongoose')
require('dotenv').config()

const connectionString = process.env.uri || 'mongodb://127.0.0.1:27017/task-manager-api'

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})