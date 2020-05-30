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
    token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjJiM2MxOWRlZGFmOTEyNTg3MjEwMjE3MGFjOThlYWNlIiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoic2x1c2giLCJhbSI6InBhc3N3b3JkIiwicCI6InJndHFXSmYwNWp4SHV5RlRyTWdaaW5RaCtBSllhVnZNejJCOElTMFlTeDFIbytJWWNVa0VZV1NlUjg3NFNyMWJ0UWhQam8rUCtSV3ZRUUNSMXIwNzM2MDk1NHhWd0RWNldFUGVDZ2xxN1N1SEZyRFQxd1BLYWVNYlBCRjhDV3Q1anBNa0IwM1dseVEyd0pNWGNRWm5EOTUrS0xRcTV0QlNqOHRDR3dwNVBYRXBIdVpZM3RUS1JIaUNTV1N4U2NEcGZsRVdtbWFhTnhIUGlMeHNBZHJ1WlRJaE5RYzdnWUoram1tN2tHOCt1SFhSVXZDN2V5cGdCMWNSbzdFendsZDNQZjZBY1hGbWZ6Y1krMjRaNEQ1dlR3LzFwdlBNWllaZUNBbFV5Ylo0QzZTRUZDOUNDdzRlWmgzRi9LdW1zVDBXRllwMVFyM1UrSUxBbjNXbXBkZjYzUT09IiwiaWFpIjoiMmIzYzE5ZGVkYWY5MTI1ODcyMTAyMTcwYWM5OGVhY2UiLCJjbHN2YyI6ImZvcnRuaXRlIiwidCI6InMiLCJpYyI6dHJ1ZSwiZXhwIjoxNTkxMDA4OTgwLCJpYXQiOjE1OTA3Nzg1ODAsImp0aSI6IjNmMDk4OGFiYjZlNjQyZDJiMDcxZGY0MTFmMWJhZDliIn0.DoR4Xnl0MdrX03g3qUv6pYg6cWBMTHq-jLgQAvJ9iSE",
    id: "2b3c19dedaf9125872102170ac98eace"
},
{
    id: "0f37f9ada53951e568b4640cf65b9d99",
    token: "eg1~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJmb3J0bml0ZSIsInN1YiI6IjBmMzdmOWFkYTUzOTUxZTU2OGI0NjQwY2Y2NWI5ZDk5IiwiZHZpZCI6IjE2NGZiMjViYjQ0ZTQyYzVhMDI3OTc3ZDBkNWRhODAwIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNDQ2Y2Q3MjY5NGM0YTQ0ODVkODFiNzdhZGJiMjE0MSIsImRuIjoiYnJpYSIsImFtIjoicGFzc3dvcmQiLCJwIjoiUFF6d2Q3MlViYVNKeWhZWDRXM0xqQUY1a1dhL3JaRitDQXdoZGo1cjJWaE9meEc0cDduZTZoUTE0V1NPVDRNUVJnSTBMcHhxdEczMitHM1U0MTZpSjdrbVhCQmZQeVlkcm5ITGF1blhacU8yc1RyTDBuWElJYVRBSjRMRCs1U0laUlVSNEhQTG1Qa2R0bGtkR3VoZzJjOVVWZ2gxRVcvQ2s5M0VIcGlwQXNHd3lrN2JEbE54UjE5TlpzRmxzYkxhU0ZqREtSRHVvYnA4TGRRWDgwYmdwaTZ4YlhiVEN5ME9NWWtHMFlQejhiMEpVUjB1N1VFM1NhUTdmZTFWdmtnMzNxclVkQ1BuYzBjbk1FY0N5Y1BLR1pXbFF5WnZFTlF1WXJZcjFFcDBKV3E0SENZa3FZVWZkWXgxd1dlTzlDSHNjM2ZSNlk2c29NMkZpeW92S2R0aUZnPT0iLCJpYWkiOiIwZjM3ZjlhZGE1Mzk1MWU1NjhiNDY0MGNmNjViOWQ5OSIsImNsc3ZjIjoiZm9ydG5pdGUiLCJ0IjoicyIsImljIjp0cnVlLCJleHAiOjE1OTEwMDkwNTQsImlhdCI6MTU5MDc3ODY1NCwianRpIjoiM2YwOTg4YWJiNmU2NDJkMmIwNzFkZjQxMWYxYmFkOWIifQ._15ZS0GKdteh3aOvUTcF02ath4YE3BlY9d6BNgG8hP0"
}]
global.xmppClients = {}
global.parties = []
global.invites = []
global.pings = []

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
