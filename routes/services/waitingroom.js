const app = require("express").Router()

app.get("/api/waitingroom", (req, res) => res.status(204).end())

module.exports = app