const express = require("express")
const crypto = require("crypto")
const path = require("path")
const app = express.Router()


app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/../html/index.html")))

app.get("/download", (req, res) => res.sendFile(path.join(__dirname, "/../html/download.html")))

app.use(express.static(path.join(__dirname, "/../html")))

app.use("/id", require(`${__dirname}/id.js`))

module.exports = app