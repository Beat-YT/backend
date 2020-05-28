const express = require("express")
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const cache = require(`${__dirname}/../../structs/caching`)
const errors = require(`${__dirname}/../../structs/errors`)

app.use(require(`${__dirname}/cloudstorage.js`))

function createResponse(changes, id, rvn) {
    rvn = Number(rvn)
    if (!rvn) {}
    else if (changes.length == 0) rvn = rvn
    else rvn = rvn + 1
    return {
        profileRevision: rvn || 1,
        profileId: id || "unknown",
        profileChangesBaseRevision: rvn || 1,
        profileChanges: changes || [],
        serverTime: new Date(),
        profileCommandRevision: rvn || 1,
        responseVersion: 1
    }
}

app.use(require(`${__dirname}/mcp`))

app.all("/api/v2/versioncheck/Windows", (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("fortnite", "prod-live"))
    res.json({type: "NO_UPDATE"})
})

app.all("/api/game/v2/tryPlayOnPlatform/account/:accountId", checkToken, (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("fortnite", "prod-live"))
    res.setHeader('Content-Type', 'text/plain')
    res.send(true)
})

app.all("/api/game/v2/enabled_features", checkToken,  (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("fortnite", "prod-live"))
    res.json([])
})

app.all("/api/storefront/v2/keychain", (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("fortnite", "prod-live"))

    res.json(cache.getKeychain())
})
module.exports = app