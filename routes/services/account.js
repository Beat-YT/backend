const config = require(`${__dirname}/../../config.json`)
const jwt = require("jsonwebtoken")
const request = require("request")
const express = require("express")
const bcrypt = require("bcrypt")
const app = express.Router()

const User = require(`${__dirname}/../../model/User`)

const checkToken = require("../../middleware/checkToken")
const createJWT = require("../../structs/createJWT")
const errors = require("../../structs/errors")


Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

app.all("/api/oauth/token", async (req, res) => {
    if (req.method != "POST") return res.status(405).json(errors.method("com.epicgames.account.public", "prod"))

    switch (req.body.grant_type) {
        case "client_credentials": 
            res.json({
                access_token: "4809072098ca4124bc21652f3d2d56fa",
                expires_in: 14400,
                expires_at: new Date().addHours(4),
                token_type: "bearer",
                client_id: "3446cd72694c4a4485d81b77adbb2141",
                internal_client: true,
                client_service: "fortnite",
            })
            return;
        case "password":
            //fuck express
            var user = await User.findOne({email: req.body.username}).catch(e => {
                next(e)
            })

            if (user) {
                if (!bcrypt.compareSync(req.body.password, user.password)) return res.status(401).json(errors.create(
                    "errors.com.epicgames.account.invalid_account_credentials", 18031,
                    "Sorry the account credentials you are using are invalid",
                    "com.epicgames.account.public", "prod", []
                ))
            } else return res.status(401).json(errors.create(
                "errors.com.epicgames.account.invalid_account_credentials", 18031,
                "Sorry the account credentials you are using are invalid",
                "com.epicgames.account.public", "prod", []
            ))
            
            token = createJWT(user.displayName, user.id, req.body.grant_type)

            if (accessTokens.find(x => x.id = user.id)) accessTokens.splice(accessTokens.findIndex(x => x.id == user.id), 1)
            accessTokens.push({
                id: user.id,
                token: `eg1~${token}`
            })
            break;
        //used for aurora launcher
        case "exchange_code":
            if (exchangeCodes[req.body.exchange_code]) {
                var user = await User.findOne({id: exchangeCodes[req.body.exchange_code]}).catch(e => {
                    next(e)
                })
                delete exchangeCodes[req.body.exchange_code]

                token = createJWT(user.displayName, user.id, req.body.grant_type)

                if (accessTokens.find(x => x.id = user.id)) accessTokens.splice(accessTokens.findIndex(x => x.id == user.id), 1)
                accessTokens.push({
                    id: user.id,
                    token: `eg1~${token}`
                })
            } else return res.status(400).json(errors.create(
                "errors.com.epicgames.account.oauth.exchange_code_not_found", 18057,
                "Sorry the exchange code you supplied was not found. It is possible that it was no longer valid",
                "com.epicgames.account.public", "prod", []
            ))
            break;
        default:
            return res.status(400).json(errors.create(
                "errors.com.epicgames.common.oauth.unsupported_grant_type", 1016,
                `Unsupported grant type: ${req.body.grant_type}`, 
                "com.epicgames.account.public", "prod", []
            ))
    }

    res.json({
        access_token: `eg1~${token}`,
        expires_in: 28800,
        expires_at: new Date().addHours(8),
        token_type: "bearer",
        refresh_token: "cd581d37b0434726a37b0268bb99206c",
        refresh_expires: 115200,
        refresh_expires_at: new Date().addHours(8),
        account_id: user.id,
        client_id: "3446cd72694c4a4485d81b77adbb2141",
        internal_client: true,
        client_service: "fortnite",
        displayName: user.displayName,
        app: "fortnite",
        in_app_id: user.id,
        device_id: "164fb25bb44e42c5a027977d0d5da800"
    })
})
  
// token killing

app.all("/api/oauth/sessions/kill/:accessToken", (req, res) => {
    if (req.method != "DELETE") return res.status(405).json(errors.method())

    accessTokens.splice(accessTokens.findIndex(x => x.token == req.token), 1)
    
    res.status(204).end()
})


// account lookup

app.all("/api/public/account/:accountId", checkToken, async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method())
    var user = await User.findOne({id: req.params.accountId})

    if (user) res.json({
        id: user.id,
        displayName: user.displayName,
        externalAuths: {}
    })
    else return res.status(404).json(errors.create(
        "errors.com.epicgames.account.account_not_found", 18007,
        `Sorry, we couldn't find an account for ${req.params.accountId}`,
        "com.epicgames.account.public", "prod"
    ))
})

app.get('/account/api/public/account/:accountId/externalAuths', checkToken, (req, res) => res.json({}))


app.all("/api/public/account/displayName/:displayName", checkToken , async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method())
    var user = await User.findOne({displayName: req.params.displayName})

    if (user) res.json({
        id: user.id,
        displayName: user.displayName,
        externalAuths: {}
    })
    else return res.status(404).json(errors.create(
        "errors.com.epicgames.account.account_not_found", 18007,
        `Sorry, we couldn't find an account for ${req.params.displayName}`,
        "com.epicgames.account.public", "prod"
    ))
})

app.all("/api/public/account/email/:email", checkToken, async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method())
    var user = await User.findOne({email: req.params.email})

    if (user) res.json({
        id: user.id,
        displayName: user.displayName,
        externalAuths: {}
    })
    else return res.status(404).json(errors.create(
        "errors.com.epicgames.account.account_not_found", 18007,
        `Sorry, we couldn't find an account for ${req.params.displayName}`,
        "com.epicgames.account.public", "prod"
    ))
})

app.all("/api/public/account", checkToken, async (req, res) => {
    if (req.method != "GET") return res.status(405).json(errors.method())

    if (req.query.accountId ? req.query.accountId.length > 100 : true) return res.status(400).json(errors.create(
        "errors.com.epicgames.account.invalid_account_id_count", 18066,
        "Sorry, the number of account id should be at least one and not more than 100.",
        "com.epicgames.account.public", "prod", []
    ))

    var users = await User.find({'id': { $in: req.query.accountId}})
    
    res.json(users.map(x => {
        return {
            id: x.id,
            displayName: x.displayName,
            externalAuths: {}
        }
    }))
})

app.use((req, res, next) => {
    res.json(errors.create(
        "errors.com.epicgames.common.not_found", 1004,
        "Sorry the resource you were trying to find could not be found",
        "com.epicgames.account.public", "prod"
    ))
})
module.exports = app