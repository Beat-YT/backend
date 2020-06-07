const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const app = express()

const cache = require(`${__dirname}/structs/caching`)
const logging = require(`${__dirname}/structs/logs`)
const config = require(`${__dirname}/config.json`)


//i know global isn't the best practice, but it works good enough
global.exchangeCodes = {}
global.clientTokens = []
global.accessTokens = []
global.xmppClients = {}
global.parties = []
global.invites = []
global.pings = []
global.mucs = []

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

require("./xmpp")

//db
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true}, async e => {
    if (e) throw e
    logging.fdev(`Connected to Mongo DB`)

    const Athena = require(`${__dirname}/model/Athena`)
    var yes = await Athena.updateMany({}, {$set: {lobbystage: "season12"}}, {strict: false, many: true})
})

require(`${__dirname}/structs/caching`)
app.use(require(`${__dirname}/routes`))

//gets the services working n shit
app.use("/lightswitch", require(`${__dirname}/routes/services/lightswitch`))
app.use("/datarouter", require(`${__dirname}/routes/services/datarouter`))
app.use("/fortnite", require(`${__dirname}/routes/services/fortnite`))
app.use("/presence", require(`${__dirname}/routes/services/presence`))
app.use("/content", require(`${__dirname}/routes/services/content`))
app.use("/account", require(`${__dirname}/routes/services/account`))
app.use("/friends", require(`${__dirname}/routes/services/friends`))
app.use("/party", require(`${__dirname}/routes/services/party`))


app.listen(process.env.port || config.port || 80, () => {
    logging.fdev(`Created by Slushia and Cyuubi, Version \x1b[36m1.0`)
    logging.fdev(`Listening on port \x1b[36m${process.env.port || config.port || 80}`)
    logging.fdev(`XMPP listening on port \x1b[36m${process.env.xmppPort || config.xmppPort || 443}`)
})
