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
        battleroyalenews: {
            news: {
                motds: [
                    {
                        entryType: "Text",
                        image: "https://cdn.discordapp.com/attachments/713173890859270276/716048896257949726/1080aurora.png",
                        tileImage: "https://cdn.discordapp.com/attachments/713173890859270276/716049291348672662/1024aurora.png",
                        hidden: false,
                        videoMute: false,
                        tabTitleOverride: "Aurora",
                        _type: "CommonUI Simple Message MOTD",
                        title: "Aurora",
                        body: "Welcome to Aurora, a private server created by Slushia (@Slushia) & Cyuubi (@uguuNatalie). Join our Discord for more information: discord.gg/AuroraFN",
                        videoLoop: false,
                        videoStreamingEnabled: false,
                        sortingPriority: 0,
                        id: `Aurora-News-0`,
                        spotlight: false
                    }
                ]
            }
        },
        emergencynotice: {
            news: {
                platform_messages: [],
                _type: "Battle Royale News",
                messages: [
                    {
                        hidden: false,
                        _type: "CommonUI Simple Message Base",
                        subgame: "br",
                        title: "Aurora",
                        body: "Credits: Slushia (@Slushia) and Cyuubi (@uguuNatalie)\nDiscord: https://discord.gg/AuroraFN",
                        spotlight: true
                    }
                ]
            },
            _title: "emergencynotice",
            _activeDate: new Date(),
            lastModified: new Date(),
            _locale: "en-US"
        }
    })
})


module.exports = app