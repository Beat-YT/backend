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
global.accessTokens = [
    {
        id: "2b3c19dedaf9125872102170ac98eace",
        token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjJiM2MxOWRlZGFmOTEyNTg3MjEwMjE3MGFjOThlYWNlIiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoic2x1c2giLCJhbSI6InBhc3N3b3JkIiwicCI6Ik1Scm9CcVVsZWFrWkVmcnJsRU92QnVUN0o5MHlxYlV2VnhLNDRQOFNmL0dQTlBnVU03NlNLdXIxUGkwL1YzY0NNbFh0S2hIK3d1VDVna2JtTFV2aUpZb3NrdlpLclJZTUt6aGFZRzFacm5QdDBYM1A5NnpKaGE1Y1A3NVFWdzk4Q3djVnR3djVMeWNER01CbktIZUR5K2xtdVRRRTRmK1RKTFc1OGhPSXRGckpKY1NBRFlORTlKbGh5NFhDNURHa1p3QTc0bHQvV3NYcmVTTkRiOHN2MHZQWlY1UjBVcHIxRStYNm13RlI5ZU5rbEhvZmYyMG5DcVlGMEpxOUJOY1FXbk9TakQvM216VjZ3eFJNMnpid3p5Y0laR0g4NklBSEVHWmZxZ1U3TWZvT2RSRlQ0b3A3OFRheWZQY1JmQ2xXcGZacFh4ZTJkZXBocjN3eWNvN3ZVUT09IiwiaWFpIjoiMmIzYzE5ZGVkYWY5MTI1ODcyMTAyMTcwYWM5OGVhY2UiLCJjbHN2YyI6ImZvcnRuaXRlIiwidCI6InMiLCJpYyI6dHJ1ZSwiZXhwIjoxNTkxMTA0NDUyLCJpYXQiOjE1OTA4NzQwNTIsImp0aSI6IjNmMDk4OGFiYjZlNjQyZDJiMDcxZGY0MTFmMWJhZDliIn0.q_RCPhMh3mdfJ_nWQEh32MhDJfb-j4zWxsWWaga7x6c"
    },
    {
        id: "0f37f9ada53951e568b4640cf65b9d99",
        token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6ImJmOThlYWNmMzYwOGZlODQ4NzUwMmU5ZjExNzEyMTIwIiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoidXd1IiwiYW0iOiJwYXNzd29yZCIsInAiOiJZQ0JaTDB4UUdXR010ZFNONyt3eUZKa3RFVk1IOCsxdzZaY0hka2VNUTJXUVNDbEMvUmtBWG1lTzdTbnF6czJ4aHBNTE5zc21nQWllUnJpR1NRa3ZhZSszc0tqa3BxbnpwVGh3ZVp3b2NYeFB1UHV3b0dwT1o2UG15OG5UN1FWOGpTcEF0ZzM1cDJpd1loRlk1NFA2K0dueTcwcFNPejBNa2VUVHlpV1djNTRLMk0rWWxQaUdrZGNzODB5b1hvMUd6U0FZeG1QRlhDZEJXSTl6VGprNVNIWEdnTElkMUxEcG9ZZ1ZDSXIxYnpUdjkwZFJwMDIvdCtXZThiUWpORGZmKzBva3VoalhSR0Q4ZjZRYWpDTlUzaDJRWlJWeFd2L3RUOENRRVZaWlhMcTNMME0zMW13OFk2L0ZLVHlESythZ2lpK0VURjZBcnVWKzNXU1c2S0RteGc9PSIsImlhaSI6ImJmOThlYWNmMzYwOGZlODQ4NzUwMmU5ZjExNzEyMTIwIiwiY2xzdmMiOiJmb3J0bml0ZSIsInQiOiJzIiwiaWMiOnRydWUsImV4cCI6MTU5MTExNzA5OCwiaWF0IjoxNTkwODg2Njk4LCJqdGkiOiIzZjA5ODhhYmI2ZTY0MmQyYjA3MWRmNDExZjFiYWQ5YiJ9.VH9fzqAMC58cx40y-HoW7v3qCVfuKsP9BsbnNxbIljI"
    }
]
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
