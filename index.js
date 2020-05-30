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
        token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjJiM2MxOWRlZGFmOTEyNTg3MjEwMjE3MGFjOThlYWNlIiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoic2x1c2giLCJhbSI6InBhc3N3b3JkIiwicCI6IkNyelJ6RGJ4dXA2TGtkQjR0YWs3YlJlODgzam1KVW5QUmNqSGZnMjFneEdJdlM3NGowb2k3U21NRmdZTjBXck91SW5mNWt2YzhFbDVMN09pdXJWd0VISEdwYWIySEtXcU51QzJTQWFEajQ0UW9SYmxsNTNHOEZTZlVaNFA4SXNPQnZwSU05QlRaODFnTzdrajJvZFNHa3ErTVcxNHQ5TGJLUDI4MXZpRzhpcEZSeXNuYmJWWUNPMnpialpaWEVKSFFCK0JtcU8zV0t5UE5yc2xVQXZ3TG0yV2RKOVhXbHJEcE14Qk0rSFd0V04reXpZMCtxU0RSb1EvbGh0QktkQ0FRRUUyQkErcEF6bFZOK1N0Yjd6MXFNTW5DTkVxRWY0WmpYQ3k2b3FvNGZkVmZBM3orYlBGd0owZFU4VHNWUkdxL0lXTWdoNnNGWi84VlhFbERQRmFmQT09IiwiaWFpIjoiMmIzYzE5ZGVkYWY5MTI1ODcyMTAyMTcwYWM5OGVhY2UiLCJjbHN2YyI6ImZvcnRuaXRlIiwidCI6InMiLCJpYyI6dHJ1ZSwiZXhwIjoxNTkxMDM1OTAyLCJpYXQiOjE1OTA4MDU1MDIsImp0aSI6IjNmMDk4OGFiYjZlNjQyZDJiMDcxZGY0MTFmMWJhZDliIn0.LwZcKdqikuw9UoN8H7nASNMMj9y0y_3XAmXdeNd7QXg"
    },
    {
        id: "0f37f9ada53951e568b4640cf65b9d99",
        token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjBmMzdmOWFkYTUzOTUxZTU2OGI0NjQwY2Y2NWI5ZDk5IiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoiYnJpYSIsImFtIjoicGFzc3dvcmQiLCJwIjoiamZSa242VmdpYXVGRmdxeXp5NUphNm9ucHdNNmR4MmQzbGpqZ3dkRndhMlozajRROENtc1A1RHJjbzlBMTEvZlhyWjdwRXlLejc3ME5jWFlLZGpFcDg0Z0NhYzhDa3lVZnF1cWdpMWVOQVBoU2JVd0NhYk9sWVRQcTBMZ0FVQ3dydVVBbnRIY0RyaTUzblpLL2UvNE5RZDYybnlFejZsMk1vVXJ6eG8wOEJxcVFiVm15M2RnbzIwSFUxclJoamp6TWp6dCt6K1I3dXRVRGQvVXVyWkJoNk5IZmcxbUozL2hnQW5iNUEwbVlKWVNnV3lBTWpnYmlRVG1qME1BUjJwRDRRNUFVbkF6aDNVak40bzdlU2RaRGtpSi9HaUI2V3lyWnVoSWhodTJTUVNMTVc1ZFl0VEh3aWp6dGF1Y3h6bWpnS1RhR09iM0s1SloxR0VpVmNhRnBnPT0iLCJpYWkiOiIwZjM3ZjlhZGE1Mzk1MWU1NjhiNDY0MGNmNjViOWQ5OSIsImNsc3ZjIjoiZm9ydG5pdGUiLCJ0IjoicyIsImljIjp0cnVlLCJleHAiOjE1OTEwMzYwMDIsImlhdCI6MTU5MDgwNTYwMiwianRpIjoiM2YwOTg4YWJiNmU2NDJkMmIwNzFkZjQxMWYxYmFkOWIifQ.PzRSzyhx_Iaczukjz-sYe8EprrtAkifM6922eVBFbu0"
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
