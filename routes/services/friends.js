const express = require("express")
const app = express.Router()

const Friends = require(`${__dirname}/../../model/Friends`)

//note: use checkToken as middleware anywhere you need to check a token for auth.
const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const createJWT = require(`${__dirname}/../../structs/createJWT`)
const errors = require(`${__dirname}/../../structs/errors`)

app.all("/api/v1/:accountId/friends", checkToken, async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method("friends", "prod"))
    if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "READ")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "READ", "friends"))

    var friends = await Friends.findOne({id: req.params.accountId})

    res.json(friends.accepted.map(x => {
        return {
            id: x.id, 
            groups: [], 
            mutual: 0, 
            alias: "", 
            note: "", 
            favorite: false, 
            created: x.createdAt
        }    
    }))
})

app.all("/api/v1/:accountId/blocklist", checkToken, (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method("friends", "prod"))
    if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "READ")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "READ", "friends"))

    res.json([])
})

app.all("/api/v1/:accountId/summary", checkToken, async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method("friends", "prod"))
    if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "READ")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "READ", "friends"))

    var friends = await Friends.findOne({id: req.params.accountId})
    res.json({
        friends: friends.accepted.map(x => {
            return {
                id: x.id, 
                groups: [], 
                mutual: 0, 
                alias: "", 
                note: "", 
                favorite: false, 
                created: x.createdAt
            }
        }),
        incoming: friends.incoming.map(x => {
            return {
                id: x.id, 
                favorite: false
            }
        }),
        outgoing: friends.outgoing.map(x => {
            return {
                id: x.id, 
                favorite: false
            }
        }),
        suggested: [], // come again bro
        blocklist: [],
        settings: {
            acceptInvites: "public"
        }
    })
})

app.all("/api/v1/:accountId/friends/:friendId", checkToken, async (req, res) => {
    if (req.method == "GET" ? false : req.method == "POST" ? false : req.method == "DELETE" ? false : true) return res.status(405).json(errors.method("friends", "prod"))

    var friends = await Friends.findOne({id: req.params.accountId})

    switch(req.method) {
        case "GET":
            if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "READ")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "READ", "friends"))

            var friend = friends.accepted.find(x => x.id == req.params.friendId)
            if (!friend) return res.status(404).json(errors.create(
                "errors.com.epicgames.friends.friendship_not_found", 14004,
                `Friendship between ${req.params.accountId} and ${req.params.friend} does not exist`,
                "friends", "prod", [req.params.accountId, req.params.friendId]
            ))

            res.json({
                id: friend.id, 
                groups: [], 
                mutual: 0, 
                alias: "", 
                note: "", 
                favorite: false, 
                created: friend.createdAt
            })
            break;
        case "POST":
            if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "UPDATE")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "UPDATE", "friends"))

            switch (true) {
                case friends.accepted.find(x => x.id == req.params.friendId) != undefined:
                    res.status(404).json(errors.create(
                        "errors.com.epicgames.friends.duplicate_friendship", 14009,
                        `Friendship between ${req.params.accountId} and ${req.params.friendId} already exists`,
                        "friends", "prod", [req.params.accountId, req.params.friendId]
                    ))
                    break;
                case friends.outgoing.find(x => x.id == req.params.friendId) != undefined:
                    res.status(404).json(errors.create(
                        "errors.com.epicgames.friends.friend_request_already_sent", 14014,
                        `Friendship request has already been sent to ${req.params.friendId}`,
                        "friends", "prod", [req.params.friendId]
                    ))
                    break;
                case friends.incoming.find(x => x.id == req.params.friendId) != undefined:
                    await Friends.updateOne({id: req.params.accountId}, {$pull: {incoming: {id: req.params.friendId}}, $push: {accepted: {id: req.params.friendId, createdAt: new Date()}}})
                    await Friends.updateOne({id: req.params.friendId}, {$pull: {outgoing: {id: req.params.accountId}}, $push: {accepted: {id: req.params.accountId, createdAt: new Date()}}})

                    res.status(204).end()
                    break;
                default:
                    await Friends.updateOne({id: req.params.accountId}, {$push: {outgoing: {id: req.params.friendId}}})
                    await Friends.updateOne({id: req.params.friendId}, {$push: {incoming: {id: req.params.accountId}}})

                    res.status(204).end()
                    break
            }
            break;
        case "DELETE":
            if(!res.locals.jwt.checkPermission(`friends:${req.params.accountId}`, "DELETE")) return res.status(403).json(errors.permission(`friends:${req.params.accountId}`, "DELETE", "friends"))

            switch (true) {
                case friends.accepted.find(x => x.id == req.params.friendId) != undefined:
                    await Friends.updateOne({id: req.params.accountId}, {$pull: {accepted: {id: req.params.friendId}}})
                    await Friends.updateOne({id: req.params.friendId}, {$pull: {accepted: {id: req.params.accountId}}})
                    
                    res.status(204).end()
                    break;
                case friends.outgoing.find(x => x.id == req.params.friendId) != undefined:
                    await Friends.updateOne({id: req.params.accountId}, {$pull: {outgoing: {id: req.params.friendId}}})
                    await Friends.updateOne({id: req.params.friendId}, {$pull: {incoming: {id: req.params.accountId}}})

                    res.status(204).end()
                    break;
                case friends.incoming.find(x => x.id == req.params.friendId) != undefined:
                    await Friends.updateOne({id: req.params.accountId}, {$pull: {incoming: {id: req.params.friendId}}})
                    await Friends.updateOne({id: req.params.friendId}, {$pull: {outgoing: {id: req.params.accountId}}})

                    res.status(204).end()
                    break;
                default:
                    res.status(404).json(errors.create(
                        "errors.com.epicgames.friends.friendship_not_found", 14004,
                        `Friendship between ${req.params.accountId} and ${req.params.friendId} does not exist`,
                        "friends", "prod", [req.params.accountId, req.params.friendId]
                    ))
                    break
            }
            break;
    }

})

module.exports = app