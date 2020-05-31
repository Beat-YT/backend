const express = require("express")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const app = express.Router()

const CommonCore = require(`${__dirname}/../model/CommonCore`)
const Friends = require(`${__dirname}/../model/Friends`)
const Athena = require(`${__dirname}/../model/Athena`)
const logging = require(`${__dirname}/../structs/logs`)
const User = require(`${__dirname}/../model/User`)

app.post("/api/register", async (req, res) => {
    if (req.body ? !req.body.username && !req.body.email && !req.body.password : true) {
        return res.status(400).json({error: `${!req.body.username ? "Username" : !req.body.email ? "Email" : "Password"} field was not provided.`})
    }

    if (!req.body.email.includes("@") && !req.body.email.includes(".")) {
        return res.status(400).json({error: `Email ${req.body.email} is invalid.`})
    }

    var bEmailExists = await User.findOne({email: req.body.email})
    var bUsernameExists = await User.findOne({displayName: req.body.username})
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
    res.json({
        id: createdUser.id,
        email: createdUser.email,
        displayName: createdUser.displayName,
        password: req.body.password
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

app.get("/api/clients", (req, res) => {
    res.setHeader("content-type", "text/plain")
    res.send(Object.keys(xmppClients).length.toString())
})


module.exports = app