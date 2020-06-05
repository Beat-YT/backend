const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const app = express()

const cache = require(`${__dirname}/structs/caching`)
const logging = require(`${__dirname}/structs/logs`)
const config = require(`${__dirname}/config.json`)


//i know global isn't the best practice, but it works good enough
global.refreshTokens = []
global.exchangeCodes = {}
global.clientTokens = []
global.accessTokens = []
global.xmppClients = {}
global.parties = []
global.invites = []
global.pings = []

//commented because i was getting stream errors?

/*
cache.cosmetics()
cache.keychain()
setInterval(() => {
    cache.cosmetics()
    cache.keychain()
}, 600000)
*/

//hopefully this should fix the memory leak issue
setInterval(() => {
    parties.forEach(party => {
        // check if the member still exists in xmpp, if not delete them and then do the check
        party.members.forEach(member => {
            if (!xmppClients[member.account_id]) {
                let index = party.members.indexOf(member);
                if (index !== 1) party.members.splice(index, 1);
            }
        });
        
        if (party.members.length <= 0) {
            let index = parties.indexOf(party);
            if (index !== -1) parties.splice(index, 1);
        }
    });
}, 120000);

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

require("./xmpp")

//db
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true}, (e) => {
    if (e) throw e
    logging.fdev(`Connected to Mongo DB`)
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