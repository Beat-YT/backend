const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const app = express()

const logging = require(`${__dirname}/structs/logs`)
const config = require(`${__dirname}/config.json`)

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

//db
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true}, (e) => {
    if (e) throw e
    logging.fdev(`Connected to Mongo DB`)
})

require(`${__dirname}/structs/caching`)
app.use(require(`${__dirname}/routes`))

app.use("/account", require(`${__dirname}/routes/services/account`))
app.use("/fortnite", require(`${__dirname}/routes/services/fortnite`))
app.use("/friends", require(`${__dirname}/routes/services/friends`))


app.listen(process.env.port || config.port || 80, () => {
    logging.fdev(`Listening on port \x1b[36m${process.env.port || config.port || 80}`)
})