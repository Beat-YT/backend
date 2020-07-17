const app = require("express").Router()

//wow
app.get("/api/waitingroom", (req, res) => res.status(204).end())

module.exports = app