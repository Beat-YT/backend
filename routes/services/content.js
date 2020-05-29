const express = require("express")
const app = express.Router()


app.get("/api/pages/fortnite-game", (req, res) => {
    res.json({
        "jcr:isCheckedOut": true,
        "_title": "Fortnite Game",
        "jcr:baseVersion": "a7ca237317f1e7883b3279-c38f-4aa7-a325-e099e4bf71e5",
        "_activeDate": "2017-08-30T03:20:48.050Z",
        "lastModified": new Date(),
        "_locale": "en-US",
        "subgameinfo": {
            "lobby": {
                "backgroundimage": "https://cdn2.unrealengine.com/Fortnite%2Ffortnite-game%2Flobby%2FT_Lobby_SeasonX-2048x1024-24e02780ed533da8001016f4e6fb14dd15e2f860.png",
                "stage": "seasonx",
                "_title": "lobby",
                "_activeDate": "2019-05-31T21:24:39.892Z",
                "lastModified":  "9999-12-31T23:59:59.999Z",
                "_locale": "en-US"
            },
        }
    })
})
module.exports = app