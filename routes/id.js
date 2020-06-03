const cookieParser = require("cookie-parser")
const request = require("request")
const express = require("express")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const app = express.Router()

const CommonCore = require(`${__dirname}/../model/CommonCore`)
const Friends = require(`${__dirname}/../model/Friends`)
const Athena = require(`${__dirname}/../model/Athena`)
const logging = require(`${__dirname}/../structs/logs`)
const User = require(`${__dirname}/../model/User`)

app.use(cookieParser())

/**
 * Virgin Slayer v2.0
 * Created to stop virgins (makks) from getting into our servers and spamming the fuck out of it.
 * @param {String} gcaptcha 
 */
function virginSlayerv2(gcaptcha) {
    return new Promise((resolve, reject) => {
        request.post("https://www.google.com/recaptcha/api/siteverify", {json: true, form: {
            secret: "6Lc-r_8UAAAAAOdX6O7zhsnwUXublLszA_ut_vCG",
            response: gcaptcha
        }}, (err, res, body) => {
            if (err) resolve(false)
            resolve(body.success)
        })
    })
}

app.post("/api/register", async (req, res) => {
    res.clearCookie("id")
    res.clearCookie("token")    
    
    var yeah = req.body.email && req.body.username && req.body.password && req.body["g-recaptcha-response"]

    if (!yeah) return res.status(400).json({
        error: `Missing '${[req.body.email ? null : "email", req.body.username ? null : "username", req.body.password ? null : "password",  req.body["g-recaptcha-response"] ? null : "g-recaptcha-response"].filter(x => x != null).join(", ")}' field(s).`,
        errorCode: "dev.aurorafn.id.register.invalid_fields",
        statusCode: 400
    })

    var bIsVirgin = await virginSlayerv2(req.body["g-recaptcha-response"])
    if (!bIsVirgin) return res.status(400).json({
        error: "Recaptcha response is invalid.",
        errorCode: "dev.aurorafn.id.register.invalid_captcha",
        statusCode: 400
    })

    if (req.body.username.length > 32 || req.body.email.length > 50) return res.status(400).json({
        error: `Field '${req.body.username.length > 32 ? "Username" : "Email"}' is too big.`,
        errorCode: `dev.aurorafn.id.register.${req.body.username.length > 32 ? "username" : "email"}_too_big`,
        statusCode: 400
    })

    var check1 = await User.findOne({displayName: new RegExp(`^${req.body.username}$`, 'i')})
    var check2 = await User.findOne({email: new RegExp(`^${req.body.email}$`, 'i')})

    if (check1 != null || check2 != null) return res.status(400).json({
        error: `${check2 != null ? "Email" : "Username"} '${check2 != null ? req.body.email : req.body.username}' already exists`,
        errorCode: `dev.aurorafn.id.register.${check2 != null ? "email" : "username"}_already_exists`,
        statusCode: 400
    })

    var ip = req.headers["X-Real-IP"] || req.ip
    if (ip.substr(0, 7) == "::ffff:") ip = ip.substr(7)

    var check3 = await User.find({ip: ip})

    if (check3.length >= 3) return res.status(400).json({
        error: `Too many accounts have been created under your IP.`,
        errorCode: `dev.aurorafn.id.register.account_limit_reached`,
        statusCode: 400
    })

    var id = crypto.randomBytes(16).toString('hex')

    var user = new User({id: id, ip: ip,displayName: req.body.username, email: req.body.email, password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))})
    user.save()
    var friends = new Friends({id: id})
    friends.save()
    var commoncore = new CommonCore({id: id})
    commoncore.save()
    var athena = new Athena({id: id})
    athena.save()

    logging.accounts(`Created account \x1b[36m${req.body.username}\x1b[0m with the ID \x1b[36m${id}`)

    res.json({
        id: id,
        email: req.body.email,
        username: req.body.username,
        message: "Account Created!"
    })
})

app.post("/api/exchange", async (req, res) => {
    if (req.body ? !req.body.email && !req.body.password : true) {
        return res.status(400).json({error: `${!req.body.username ? "Email" : "Password"} field was not provided.`})
    }

    var user = await User.findOne({email: req.body.email})
    var code = crypto.randomBytes(16).toString('hex')

    if (bcrypt.compareSync(req.body.password, user.password)) {
        setTimeout(() => {
            if (exchangeCodes[code]) delete exchangeCodes[code]
        }, 300000) // 300 seconds 
        exchangeCodes[code] = user.id
        res.json({
            code: code,
            expiringIn: 300
        })
    } else {
        return res.status(400).json({error: `Password is invalid.`})
    }
})

app.get("/api/ip", (req, res) => {
    var ip = req.headers["X-Real-IP"] || req.ip
    if (ip.substr(0, 7) == "::ffff:") ip = ip.substr(7)
    
    res.setHeader("content-type", "text/plain")
    res.send(ip)
})

app.get("/api/clients", (req, res) => {
    res.setHeader("content-type", "text/plain")
    res.send(Object.keys(xmppClients).length.toString())
})

app.get("/api/parties", (req, res) => {
    res.setHeader("content-type", "text/plain")
    res.send(parties.length.toString())
})

app.post("/api/login", async (req, res) => {
    if (req.body ? !req.body.email && !req.body.password : true) {
        return res.status(400).json({error: `${!req.body.username ? "Email" : "Password"} field was not provided.`})
    }

    var user = await User.findOne({email: new RegExp(`^${req.body.email}$`, 'i') })

    if (!user) return res.status(404).json({
        code: 404,
        message: "Account not found."
    })

    if (bcrypt.compareSync(req.body.password, user.password)) {
        var code = bcrypt.hashSync(`${user.id}:omegalul`, bcrypt.genSaltSync(10))
        res.cookie("id", user.id)
        res.cookie("token", code)
        res.redirect("/account")
    } else {
        res.status(401).json({
            code: 401,
            message: "Credentials incorrect."
        })
    }

})

app.get("/api/me", async (req, res) => {
    if (req.headers.discordauthor && req.headers.authorization == "slushbot!!") {
        var user = await User.findOne({"discord.id": req.headers.discordauthor})

        if (user) {
            var user = await User.findOne({"discord.id": req.headers.discordauthor})
            var athena = await Athena.findOne({id: user.id})
            var commoncore = await CommonCore.findOne({id: user.id})
    
            res.json({
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                discord: user.discord,
                athena: {
                    level: athena.level,
                    banner: athena.banner
                },
                commoncore: {
                    vbucks: commoncore.vbucks
                }
            })
        }  else {
            res.status(404).json({
                code: 404,
                message: "User is not linked to discord."
            })
        }
    } else if (req.cookies.token && req.cookies.id) {
        //2am: w hat could go wrong
        if (!bcrypt.compareSync(`${req.cookies.id}:omegalul`, req.cookies.token)) return res.status(401).json({
            code: 401,
            message: "Unauthorized, is your token invalid?"
        })

        var user = await User.findOne({id: req.cookies.id})
        var athena = await Athena.findOne({id: user.id})
        var commoncore = await CommonCore.findOne({id: user.id})

        res.json({
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            discord: user.discord,
            athena: {
                level: athena.level,
                banner: athena.banner
            },
            commoncore: {
                vbucks: commoncore.vbucks
            }
        })
    } else res.status(404).end()
})

app.get("/api/discord/link", async (req, res) => {
    if (!req.query.code) return res.status(400).json({
        code: 400,
        message: "Code query not provided"
    })

    request.post("https://discordapp.com/api/oauth2/token", ({form: {
        client_id: "716499338016325712",
        client_secret: "e_Tsc9ydOoGitRfhTr6I5izLOMtC5VZV",
        grant_type: "authorization_code",
        redirect_uri: "http://localhost/id/api/discord/link",
        scope: ["identify"],
        code: req.query.code
    }}), (err, response, body) => {
        body = JSON.parse(body)

        request("https://discordapp.com/api/users/@me", ({
            headers: {
                authorization: `Bearer ${body.access_token}`
            }
        }), async (err, response, body) => {
            body = JSON.parse(body)

            if (bcrypt.compareSync(`${req.cookies.id}:omegalul`, req.cookies.token)) {
                var check = await User.findOne({"discord.id": body.id})

                if (check) await User.updateOne({id: check.id}, {discord: {}})
                
                await User.updateOne({id: req.cookies.id}, {discord: {
                    id: body.id,
                    username: body.username,
                    discriminator: body.discriminator
                }})

                res.redirect("/account")

            } else return res.status(401).json({
                code: 401,
                message: "Unauthorized, is your token invalid?"
            })
        })


    })
})

app.post("/api/logout", (req, res) => {
    res.clearCookie("id")
    res.clearCookie("token")
    res.redirect("/login")
})

app.delete("/api/discord/unlink", async (req, res) => {

    if (req.headers.discordauthor && req.headers.authorization == "slushbot!!") {
        await User.updateOne({"discord.id": req.headers.discordauthor}, {discord: {}})

        res.json({
            code: 200,
            message: "Unlinked account"
        })
    } else res.status(404).json({
        code: 400,
        message: "Unauthorized, is your token invalid?"
    })
})

app.post("/api/vbucks", async (req, res) => {

    if (req.headers.discordauthor && req.headers.authorization == "slushbot!!") {
        var user = await User.findOne({"discord.id": req.headers.discordauthor})
        if (!user) return res.status(404).end()

        if (req.body.vbucks > 2147483647) vbucks = 2147483647; else vbucks = req.body.vbucks   

        await CommonCore.updateOne({id: user.id}, {vbucks: vbucks})

        res.status(204).end()
    } else if (req.cookies.token) {
        //2am: w hat could go wrong
        if (!bcrypt.compareSync(`${req.cookies.id}:omegalul`, req.cookies.token)) return res.status(401).json({
            code: 401,
            message: "Unauthorized, is your token invalid?"
        })

        var vbucks
        if (req.body.vbucks > 2147483647) vbucks = 2147483647; else vbucks = req.body.vbucks   

        await CommonCore.updateOne({id: req.cookies.id}, {vbucks: vbucks})
        res.redirect("/account")

    } else res.status(404).end()
})

app.post("/api/level", async (req, res) => {
    if (req.headers.discordauthor && req.headers.authorization == "slushbot!!") {
        var user = await User.findOne({"discord.id": req.headers.discordauthor})
        if (!user) return res.status(404).end()

        var level
        if (req.body.level > 9999) level = 9999; else level = req.body.level

        await Athena.updateOne({id: user.id}, {level: level})
        res.status(204).end()
    } else if (req.cookies.token) {
        //2am: w hat could go wrong
        if (!bcrypt.compareSync(`${req.cookies.id}:omegalul`, req.cookies.token)) return res.status(401).json({
            code: 401,
            message: "Unauthorized, is your token invalid?"
        })


        var level
        if (req.body.level > 9999) level = 9999; else level = req.body.level

        await Athena.updateOne({id: req.cookies.id}, {level: level})
        res.redirect("/account")

    } else res.status(404).end()
})

module.exports = app
