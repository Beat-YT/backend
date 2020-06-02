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


app.post("/api/register", async (req, res) => {
    try {
        if (req.body ? !req.body.username && !req.body.email && !req.body.password : true) {
            return res.status(400).json({error: `${!req.body.username ? "Username" : !req.body.email ? "Email" : "Password"} field was not provided.`})
        }
    
        if (!req.body.email.includes("@") && !req.body.email.includes(".")) {
            return res.status(400).json({error: `Email ${req.body.email} is invalid.`})
        }
    
        // to stop UI being spammed
        if (req.body.username.length > 16) {
            return res.status(400).json({error: "Display name length must be 1-16."});
        }
    
        var bEmailExists = await User.findOne({email: req.body.email.toLowerCase()})
        var bUsernameExists = await User.find({displayName: new RegExp(`^${req.body.username}$`, 'i') })
    
        if (bUsernameExists.length != 0) bUsernameExists = true
        else bUsernameExists = null
        if (bUsernameExists != null || bEmailExists != null) return res.status(400).json({
            error: `${bUsernameExists ? "Username" : "Email"} already exists.`
        })
    
        const id = crypto.randomBytes(16).toString('hex')
    
        const user = new User({
            id: id,
            displayName: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        })
    
        const friends = new Friends({id: id})
        friends.save()
    
        const commoncore = new CommonCore({id: id})
        commoncore.save()
    
        const athena = new Athena({id: id})
        athena.save()
    
        logging.accounts(`Created account \x1b[36m${req.body.username}\x1b[0m with the ID \x1b[36m${id}`)
        const createdUser = await user.save().catch(e => res.status(400).send(e))
        res.redirect("/login")
    } catch (e) {
        return res.status(500).json({error: "Failed to register. Please check that your username does not contain any illegal characters."});
    }
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

app.get("/api/clients", (req, res) => {
    res.setHeader("content-type", "text/plain")
    res.send(Object.keys(xmppClients).length.toString())
})

app.post("/api/login", async (req, res) => {
    if (req.body ? !req.body.email && !req.body.password : true) {
        return res.status(400).json({error: `${!req.body.username ? "Email" : "Password"} field was not provided.`})
    }

    var user = await User.find({email: new RegExp(`^${req.body.email}$`, 'i') })
    if (user.length != 0) user = user[0]
    else user = null

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
    } else if (req.cookies.token) {
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