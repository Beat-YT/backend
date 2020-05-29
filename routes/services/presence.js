const express = require('express')
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)

app.all("/api/v1/_/:accountId/settings/subscriptions", checkToken, (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("presence", "prod"))

    res.status(204).end()
})

module.exports = app
