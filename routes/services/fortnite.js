const express = require("express")
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const errors = require(`${__dirname}/../../structs/errors`)

app.use(require(`${__dirname}/cloudstorage.js`))

module.exports = app