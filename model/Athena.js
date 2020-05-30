const mongoose = require("mongoose")
const crypto = require("crypto")

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    level: {
        type: Number,
        default: 999
    },
    banner: {
        type: String,
        default: ""
    },
    bannercolor: {
        type: String,
        default: ""
    },
    character: {
        type: String,
        default: ""
    },
    backpack: {
        type: String,
        default: ""
    },
    pickaxe: {
        type: String,
        default: ""
    },
    glider: {
        type: String,
        default: ""
    },
    skydivecontrail: {
        type: String,
        default: ""
    },
    dance: {
        type: Array,
        default: [
            "",
            "",
            "",
            "",
            "",
            "",
        ]
    },
    itemwrap: {
        type: Array,
        default: [
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ]
    },
    musicpack: {
        type: String,
        default: ""
    },
    loadingscreen: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model("athena", schema)