const express = require("express")
const crypto = require("crypto")
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const Party = require(`../../party/Party`)
const errors = require(`${__dirname}/../../structs/errors`)

app.all("/api/v1/Fortnite/user/:accountId", checkToken, (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("party", "prod"))
    res.json({
        current: parties.filter(x => x.id == req.params.accountId),
        invites: invites.filter(x => x.id == req.params.accountId),
        pending: [],
        pings: pings.filter(x => x.id == req.params.accountId),
    })
})

//create party
app.all("/api/v1/Fortnite/parties", checkToken, (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("party", "prod"))

    var yeah = req.body.config && req.body.join_info && req.body.meta
    if (!yeah) return res.status(400).json(errors.create(
        "errors.com.epicgames.common.json_mapping_error", 1019,
        "Json mapping failed.", 
        "party", "prod", [
            req.body.config ? null : "config",
            req.body.meta ? null : "meta",
            req.body.join_info ? null : "join_info"
        ].filter(x => x != null)
    ))

    /*
    if (!xmppClients.find(x => x.id = res.locals.jwt.accountId)) res.json(errors.create(
        "errors.com.epicgames.social.party.user_is_offline", 51024,
        `Operation is forbidden because the user ${res.locals.jwt.accountId} is offline.`,
        "party", "prod", [res.locals.jwt.accountId]
    ))*/

    var party = new Party(req.body.config, req.body.join_info, req.body.meta)
    
    res.json(party.getPartyInfo())
})

//update party!
app.all("/api/v1/Fortnite/parties/:partyId", (req, res) => {
    if(req.method != "PATCH" ? req.method != "GET" ?  req.method != "DELETE" ? true : false : false : false) return res.status(405).json(errors.method("party", "prod"))
    var party = parties.find(x => x.id = req.params.partyId)
    if (!party) return res.status(404).json(errors.create(
        "errors.com.epicgames.social.party.party_not_found", 51002,
        `Sorry, we couldn't find a party by id ${req.params.partyId}`,
        "party", "prod", [req.params.partyId.toString()]
    ))
    
    if (req.method == "GET") return res.json(party.party.getPartyInfo())

    if (req.method == "DELETE") {
        party.party.deleteParty()
        res.status(204).end()
    }

    party.party.updatePartyMeta(req.body.meta.update, req.body.meta.delete)
    res.status(204).send()
})

app.all("/api/v1/Fortnite/parties/:partyId/members/:accountId/meta", (req, res) => {
    if(req.method != "PATCH") return res.status(405).json(errors.method("party", "prod"))
    var party = parties.find(x => x.id = req.params.partyId)
    if (!party) return res.status(404).json(errors.create(
        "errors.com.epicgames.social.party.party_not_found", 51002,
        `Sorry, we couldn't find a party by id ${req.params.partyId}`,
        "party", "prod", [req.params.partyId.toString()]
    ))

    party.party.updateUserMeta(req.params.accountId, req.body.update, req.body.delete)
    res.status(204).send()
})


//delete member
app.all("/api/v1/Fortnite/parties/:partyId/members/:accountId", (req, res) => {
    if(req.method != "DELETE") return res.status(405).json(errors.method("party", "prod"))

    var party = parties.find(x => x.id = req.params.partyId)
    if (!party) return res.status(404).json(errors.create(
        "errors.com.epicgames.social.party.party_not_found", 51002,
        `Sorry, we couldn't find a party by id ${req.params.partyId}`,
        "party", "prod", [req.params.partyId.toString()]
    ))

    party.party.removeMember(req.params.accountId)
    res.status(204).end()
})

module.exports = app