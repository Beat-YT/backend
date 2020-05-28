const express = require("express")
const app = express.Router()

app.all("/api/v1/public/data", (req, res) => res.status(204).end())
module.exports = app