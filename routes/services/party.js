const express = require("express")
const crypto = require("crypto")
const app = express.Router()


const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const errors = require(`${__dirname}/../../structs/errors`)
const Friends = require(`${__dirname}/../../model/Friends`)
const Party = require(`../../party`)

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

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


    if (!xmppClients[res.locals.jwt.accountId]) return res.json(errors.create(
        "errors.com.epicgames.social.party.user_is_offline", 51024,
        `Operation is forbidden because the user ${res.locals.jwt.accountId} is offline.`,
        "party", "prod", [res.locals.jwt.accountId]
    ))

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


//join party
app.all("/api/v1/Fortnite/parties/:accountId/members/:partyId/join", (req, res) => {
    var party = parties.find(x => x.id = req.params.partyId)

    if (!party) {
        res.status(404).json(errors.create(
            "errors.com.epicgames.social.party.party_not_found", 51002,
            `Sorry, we couldn't find a party by id ${req.params.partyId}`,
            "party", "prod", [req.params.partyId.toString()]
        ))
    } else {
        party.party.addMember(req.body.connection, req.body.meta)
        res.json({
            status : "PENDING_CONFIRMATION",
            party_id : req.params.partyId
        })
    }

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

app.all("/api/v1/Fortnite/user/:pingerId/pings/:accountId", checkToken, async (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("party", "prod"))
    var friends = await Friends.findOne({id: req.params.accountId})

    if (!friends.accepted.find(x => x.id == req.params.pingerId)) return res.status(403).json(errors.create(
        "errors.com.epicgames.social.party.ping_forbidden", 51020,
        `The user ${req.params.accountId} has no right to ping ${req.params.pingerId}.`,
        "party", "prod", [req.params.accountId, req.params.pingerId]
    ))

    if (pings.find(x => x.sent_by == req.params.accountId)) pings.splice(pings.findIndex(x => x.sent_by == req.params.accountId), 1)

    pings.push({
        sent_by: req.params.accountId,
        sent_to: req.params.pingerId,
        sent_at: new Date(),
        expires_at: new Date().addHours(1),
        meta: {}
    })

    res.json(pings.find(x => x.sent_by == req.params.accountId))

    if (xmppClients[req.params.pingerId]) {
        xmppClients[req.params.pingerId].client.sendMessage("xmpp-admin@prod.ol.epicgames.com", JSON.stringify({
            sent: pings.find(x => x.sent_by == req.params.accountId).sent_at,
            type: "com.epicgames.social.party.notification.v0.PING",
            ns: "Fortnite",
            pinger_id: req.params.accountId,
            pinger_dn: res.locals.jwt.displayName,
            expires: pings.find(x => x.sent_by == req.params.accountId).expires_at,
            meta: {}
        }))
    }
})

app.all("/api/v1/Fortnite/user/:accountId/pings/:pingerId/parties", (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method("party", "prod"))

    res.json(pings.filter(x => x.sent_by == req.params.pingerId).filter(x => x.sent_to == req.params.accountId).map(x => {
        var party = parties.find(y => y.members.includes(x.sent_by))
        if (!party) return undefined
        else party = party.party

        return {
            id: party.id,
            created_at: party.createdAt,
            updated_at: party.updatedAt,
            config: party.config,
            members: party.members,
            applicants: [],
            meta: party.meta,
            invites: [],
            revision: party.revision || 0
        }
    }))
})

app.all("/api/v1/Fortnite/user/:accountId/notifications/undelivered/count", checkToken, (req, res) => {
    if(req.method != "GET") return res.status(405).json(errors.method("party", "prod"))
    if(res.locals.jwt.accountId != req.params.accountId) return res.status(403).json(errors.create(
        "errors.com.epicgames.social.party.user_operation_forbidden", 51023,
        `The target accountId ${req.params.accountId} doesn't match the authenticated user ${res.locals.jwt.accountId}.`,
        "party", "prod", [req.params.accountId, res.locals.jwt.accountId]
    ))

    res.json({
        invites: invites.filter(x => x.id == req.params.accountId).length,
        pings: pings.filter(x => x.id == req.params.accountId).length
    })
})

//https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/user/a44546da44fb460784d1c793fa95c3c2/pings/{{account_id}}/join

/**
 * {
  "status": "PENDING_CONFIRMATION",
  "party_id": "5489da5c5b27465e8b1f27c137293e47"
}
 */
app.use((req, res, next) => {
    res.status(404).json(errors.create(
        "errors.com.epicgames.common.not_found", 1004,
        "Sorry the resource you were trying to find could not be found",
        "party", "prod"
    ))
})

module.exports = app