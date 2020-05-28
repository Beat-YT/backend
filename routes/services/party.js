const express = require("express")
const crypto = require("crypto")
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const Party = require(`../../structs/Party`)
const errors = require(`${__dirname}/../../structs/errors`)

app.get("/api/v1/Fortnite/user/:accountId", checkToken, (req, res) => {
    res.json({
        current: parties.filter(x => x.id == req.params.accountId),
        invites: invites.filter(x => x.id == req.params.accountId),
        pending: [],
        pings: pings.filter(x => x.id == req.params.accountId),
    })
})

//create party
app.post("/api/v1/Fortnite/parties", checkToken, (req, res) => {
    var party = new Party(req.body.config, req.body.join_info, req.body.meta)
    
    res.json(party.getPartyInfo())
})

module.exports = app