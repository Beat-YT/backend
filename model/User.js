const mongoose = require("mongoose")
const crypto = require("crypto")

const schema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        min: 3,
        max: 100
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 100
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    id: {
        type: String,
        default: crypto.randomBytes(16).toString("hex")
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("users", schema)