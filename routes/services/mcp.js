const express = require("express")
const crypto = require("crypto")
const app = express.Router()


const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const CommonCore = require(`${__dirname}/../../model/CommonCore`)
const profiles = require(`${__dirname}/../../structs/profiles`)
const Athena = require(`${__dirname}/../../model/Athena`)
const errors = require(`${__dirname}/../../structs/errors`)

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

//query profile
app.all(`/api/game/v2/profile/:accountId/client/QueryProfile`, checkToken, async (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("fortnite", "prod-live"))
    if(!res.locals.jwt.checkPermission(`fortnite:profile:${req.params.accountId}:commands`, "ALL")) 
        return res.status(403).json(errors.permission(`fortnite:profile:${req.params.accountId}:commands`, "ALL", "fortnite", "prod-live"))

    switch (req.query.profileId) {
        case "athena":
            var profile = await profiles.athena(req.params.accountId)
            res.json(createResponse([profile], "athena"));
            break;
        case "creative":
            res.json(createResponse([], "creative"));
            break;
        case "common_core":
            var profile = await profiles.commoncore(req.params.accountId)
            res.json(createResponse([profile], "common_core"));
            break;
        case "common_public":
            res.json(createResponse([], "common_public"));
            break;
        default:
            res.status(400).json(errors.create(
                "errors.com.epicgames.modules.profiles.operation_forbidden", 12813, // Code
                `Unable to find template configuration for profile ${req.query.profileId}`, // Message
                "fortnite", "prod-live", // Service & Intent
                [req.query.profileId] // Variables
            ))      
            break;
    }
})

app.all(`/api/game/v2/profile/:accountId/client/ClientQuestLogin`, checkToken, async (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("fortnite", "prod-live"))
    if(!res.locals.jwt.checkPermission(`fortnite:profile:${req.params.accountId}:commands`, "ALL")) 
        return res.status(403).json(errors.permission(`fortnite:profile:${req.params.accountId}:commands`, "ALL", "fortnite", "prod-live"))

    switch (req.query.profileId) {
        case "athena":
            var profile = await profiles.athena(req.params.accountId)
            res.json(createResponse([profile], "athena"));
            break;
        case "creative":
            res.json(createResponse([], "creative"));
            break;
        case "common_core":
            var profile = await profiles.commoncore(req.params.accountId)
            res.json(createResponse([profile], "common_core"));
            break;
        case "common_public":
            res.json(createResponse([], "common_public"));
            break;
        default:
            res.status(400).json(errors.create(
                "errors.com.epicgames.modules.profiles.operation_forbidden", 12813, // Code
                `Unable to find template configuration for profile ${req.query.profileId}`, // Message
                "fortnite", "prod-live", // Service & Intent
                [req.query.profileId] // Variables
            ))      
            break;
    }
})

app.post("/api/game/v2/profile/:accountId/client/SetMtxPlatform", checkToken, async (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("fortnite", "prod-live"))
    if(!res.locals.jwt.checkPermission(`fortnite:profile:${req.params.accountId}:commands`, "ALL")) 
        return res.status(403).json(errors.permission(`fortnite:profile:${req.params.accountId}:commands`, "ALL", "fortnite", "prod-live"))

    var types = ["WeGame", "EpicPCKorea", "Epic", "EpicPC", "EpicAndroid", "PSN", "Live", "IOSAppStore", "Nintendo", "Samsung", "GooglePlay", "Shared"]
    
    if (req.query.profileId != "common_core") return res.status(400).json(errors.create(
        "errors.com.epicgames.modules.profiles.invalid_command", 12801, // Code
        `SetMtxPlatform is not valid on player:profile_${req.query.profileId} profiles (${req.query.profileId})`, // Message
        "fortnite", "prod-live", // Service & Intent
        ["SetMtxPlatform", `player:profile_${req.query.profileId}`, req.query.profileId] // Variables
    )) 

    if (!req.body.newPlatform) return res.status(400).json(errors.create(
        "errors.com.epicgames.validation.validation_failed", 12801, // Code
        `Validation Failed. Invalid fields were [newPlatform]`, // Message
        "fortnite", "prod-live", // Service & Intent
        ["[newPlatform]"] // Variables
    )) 

    if (!types.includes(req.body.newPlatform)) return res.status(400).json(errors.create(
        "errors.com.epicgames.validation.validation_failed", 12801, // Code
        //shortening this one cuz like yeah
        `Unable to parse command com.epicgames.fortnite.core.game.commands.mtx.SetMtxPlatform: value not one of declared Enum instance names: [WeGame, EpicPCKorea, Epic, EpicPC, EpicAndroid, PSN, Live, IOSAppStore, Nintendo, Samsung, GooglePlay, Shared]`, // Message
        "fortnite", "prod-live", // Service & Intent
        ["com.epicgames.fortnite.core.game.commands.mtx.SetMtxPlatform"] // Variables
    ))

    var profile = await CommonCore.findOne({id: req.params.accountId})        

    if (profile.mtxplatform == req.body.newPlatform) {
        res.json(createResponse([], "common_core", req.query.rvn))
    } else {
        var profile = await CommonCore.updateOne({id: req.params.accountId}, {mtxplatform: req.body.newPlatform})

        res.json(createResponse([{
            changeType: "statModified",
            name: "current_mtx_platform",
            value: req.body.newPlatform
        }], req.query.profileId, req.query.rvn));
    }
});

app.post("/api/game/v2/profile/:accountId/client/SetCosmeticLockerSlot", async (req, res) => {
    if(req.method != "POST") return res.status(405).json(errors.method("fortnite", "prod-live"))
    if(!res.locals.jwt.checkPermission(`fortnite:profile:${req.params.accountId}:commands`, "ALL")) 
        return res.status(403).json(errors.permission(`fortnite:profile:${req.params.accountId}:commands`, "ALL", "fortnite", "prod-live"))

    var bHasValidSlot = req.body.slotIndex ? true : req.body.slotIndex == 0 ? true : false
    var bHasValidItem = req.body.itemToSlot ? true : req.body.itemToSlot == "" ? true : false

    if (!bHasValidSlot || !bHasValidItem) {
        return res.status(400).json(
            errors.create(
                "errors.com.epicgames.validation.validation_failed", 1040, // Code
                `Validation Failed. Valid fields are [lockerItem, category, slotIndex, itemToSlot]`, // Message

                "fortnite", "prod-live", // Service & Intent

                [req.query.profileId] // Variables
            )
        );
    }

    var item 
    if (req.body.itemToSlot.split(":").length == 2) {
        item = `${req.body.itemToSlot.split(":")[0]}:${req.body.itemToSlot.split(":")[1].toLowerCase()}`
    } else {
        item = ""
    }

    if (req.body.category == "Dance" || req.body.category == "ItemWrap") {
        if (req.body.slotIndex == -1) {
            var why = []
            var num = req.body.category == "Dance" ? 6 : 7
            for (i = 0; i < num; i++) {
                why.push(item)
            }
            await Athena.updateOne({id: req.params.accountId}, {[req.body.category.toLowerCase()]: why})
        } else await Athena.updateOne({id: req.params.accountId}, {$set: {[`${req.body.category.toLowerCase()}.${req.body.slotIndex}`]: req.body.itemToSlot}})
    } else {
        await Athena.updateOne({id: req.params.accountId}, {[req.body.category.toLowerCase()]: item})
    }

    var locker = await Athena.findOne({id: req.params.accountId})

    res.json(createResponse([{
        changeType: "itemAttrChanged",
        attributeName: "locker_slots_data",
        itemId: req.body.lockerItem,
        attributeValue: {
            slots: {
                Glider: {
                    items: [
                        locker.glider
                    ]
                },
                Dance: {
                    items: locker.dance,
                    activeVariants: [
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    ]
                },
                SkyDiveContrail: {
                    items: [
                        locker.skydivecontrail
                    ]
                },
                LoadingScreen: {
                    items: [
                        locker.loadingscreen
                    ]
                },
                Pickaxe: {
                    items: [
                        locker.pickaxe
                    ]
                },
                ItemWrap: {
                    items: locker.itemwrap,
                },
                MusicPack: {
                    items: [
                        locker.musicpack
                    ]
                },
                Character: {
                    items: [
                        locker.character
                    ],
                    activeVariants: [
                        null
                    ]
                },
                Backpack: {
                    items: [
                        locker.backpack
                    ],
                    activeVariants: [
                        null
                    ]
                }
            }
        }
    }], "athena", Number(req.query.rvn)))
})



module.exports = app