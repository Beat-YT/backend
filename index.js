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
global.accessTokens = [{
    token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjQ1YzNiMjRlNDk5OWQ4YWMxMDI4MGFmNDI4YjgxM2E2IiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoicGFzc3dvcmQiLCJhbSI6InNsdXNoIiwicCI6Imx4U053OFJRQlVjTFB1bjgvRDVKOVJYRVVSV09IUk5lMEx6OGNPcWloc3JKNE1oVmtWZVRFNWRvbUNHTjVtS3FSM2RMcU8zQUtPU2pKS2lHc2tkdTVsazFzUTIzV1RYbk9PeXRBV3dWTktnN3R4NjFSdldaRVdkQWJJQk1MNEFlMkc0ZjlldEFRT3ZLLzVXS3JFanhyNmVyR2ZSUDU2UFNQQnl1dU5wVGZUK1RsZ3JqUXhQdm5wcVg2bEhpdWs5NVZBOHB3UmtFSGtVQUoyRmJZOHRLMFFwbjV3MS9kZWowOUJTZGVGSUs4RXBRYVlZb1BCdCtraGlCTVBKSE81UnZiUGFMZ0x4SGFUTFppWkVvck53UmRVaU8yZjJFUnJwNytyZE5rRWdJTm1iNGNidk5scWhOZVRnZ2Q2Y01KVVl1UXV2bmphdDF2NEk3bjNhQTh4RCtyQT09IiwiaWFpIjoiNDVjM2IyNGU0OTk5ZDhhYzEwMjgwYWY0MjhiODEzYTYiLCJjbHN2YyI6ImZvcnRuaXRlIiwidCI6InMiLCJpYyI6dHJ1ZSwiZXhwIjoxNTkwODYwNDk1LCJpYXQiOjE1OTA2MzAwOTUsImp0aSI6IjNmMDk4OGFiYjZlNjQyZDJiMDcxZGY0MTFmMWJhZDliIn0.BPeMMnOBDf93uBcGHuZVJxOk80FCTU4br-MNAdayspU",
    id: "45c3b24e4999d8ac10280af428b813a6"
}]
global.xmppClients = []
global.parties = []
global.invites = []
global.pings = []

cache.cosmetics()
cache.keychain()
setInterval(() => {
    cache.cosmetics()
    cache.keychain()
}, 600000)


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

require("./xmpp/server")

//db
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true}, (e) => {
    if (e) throw e
    logging.fdev(`Connected to Mongo DB`)
})

require(`${__dirname}/structs/caching`)
app.use(require(`${__dirname}/routes`))

app.use("/lightswitch", require(`${__dirname}/routes/services/lightswitch`))
app.use("/datarouter", require(`${__dirname}/routes/services/datarouter`))
app.use("/fortnite", require(`${__dirname}/routes/services/fortnite`))
app.use("/account", require(`${__dirname}/routes/services/account`))
app.use("/friends", require(`${__dirname}/routes/services/friends`))
app.use("/party", require(`${__dirname}/routes/services/party`))


app.listen(process.env.port || config.port || 80, () => {
    logging.fdev(`Listening on port \x1b[36m${process.env.port || config.port || 80}`)
})
