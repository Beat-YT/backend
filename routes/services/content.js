const express = require("express")
const request = require("request")
const app = express.Router()



app.get("/api/pages/fortnite-game", (req, res) => {
    res.json({
        "jcr:isCheckedOut": true,
        _title: "Fortnite Game",
        "jcr:baseVersion": "a7ca237317f1e7883b3279-c38f-4aa7-a325-e099e4bf71e5",
        _activeDate: "2017-08-30T03:20:48.050Z",
        lastModified: new Date(),
        _locale: "en-US",
        subgameinfo: {
            battleroyalenews: {
                news: {
                    motds: [
                        {
                            entryType: "Item",
                            image: "https://cdn.discordapp.com/attachments/713173890859270276/716048896257949726/1080aurora.png",
                            tileImage: "https://cdn.discordapp.com/attachments/713173890859270276/716049291348672662/1024aurora.png",
                            hidden: false,
                            videoMute: false,
                            tabTitleOverride: "Aurora",
                            _type: "CommonUI Simple Message MOTD",
                            title: "Aurora",
                            body: "Welcome to Aurora, a private server created by Slushia (@Slushia) & Cyuubi (@uguuNatalie). Join our Discord here for more information: discord.gg/AuroraPS",
                            videoLoop: false,
                            videoStreamingEnabled: false,
                            sortingPriority: 0,
                            id: `Aurora-News-0`,
                            spotlight: false
                        }
                    ]
                }
            }   
        }
    })
})
module.exports = app