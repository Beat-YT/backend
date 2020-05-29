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
    token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjJiM2MxOWRlZGFmOTEyNTg3MjEwMjE3MGFjOThlYWNlIiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoic2x1c2giLCJhbSI6InBhc3N3b3JkIiwicCI6IkxoTUhGeGNvbm1QOSt1RmI3aDRMQXJKZHVWNnlKdkNVeWJKbFV5TW8xaHQ0eldNRHI0V2ZSYzNGelhVSU1PQTRhc3JSb0dCR09GTjV3SG4xWXdQWCtRL0hUZGwyYmZFNWxyOXI0TVpZczRNMkpGLzRxM1cycDFXV2c0UVN2QzRSaU1ybDZlWCtIVHRRQmMxNEJ5Z2Noc2U1YisvYWdiU3U5bXQwNTJkNWxzY2toWmV4dllnQzQxbHNjQ0FocHg5eDB4QVdCTzQwN0ZpZzRzNmU1TVdvS3oxbDFKVDh3a2J6cFpwMmZnUjZHeFBrbXJ0Y1hNNUZmbXJKV0xsdmFFVEh5NWVWMklyNWxwZnR5MFlhVXZ3RDZmaU5ZQURrNnByeS95bmEyYm9VVFBWYkh3dTZoY1VkRFBQQVpkTWlWVy9XV2dLN1lrWFpOS0pZME9SZERKekZYZz09IiwiaWFpIjoiMmIzYzE5ZGVkYWY5MTI1ODcyMTAyMTcwYWM5OGVhY2UiLCJjbHN2YyI6ImZvcnRuaXRlIiwidCI6InMiLCJpYyI6dHJ1ZSwiZXhwIjoxNTkwOTQ3NDUxLCJpYXQiOjE1OTA3MTcwNTEsImp0aSI6IjNmMDk4OGFiYjZlNjQyZDJiMDcxZGY0MTFmMWJhZDliIn0.ErIVj1YftzFNSs9H3Z3vNkTAwWJ9qDUdwOY9p-o6s94",
    id: "2b3c19dedaf9125872102170ac98eace"
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
app.use("/presence", require(`${__dirname}/routes/services/presence`))
app.use("/content", require(`${__dirname}/routes/services/content`))
app.use("/account", require(`${__dirname}/routes/services/account`))
app.use("/friends", require(`${__dirname}/routes/services/friends`))
app.use("/party", require(`${__dirname}/routes/services/party`))


app.listen(process.env.port || config.port || 80, () => {
    logging.fdev(`Listening on port \x1b[36m${process.env.port || config.port || 80}`)
})
