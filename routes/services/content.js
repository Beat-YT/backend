const express = require("express")
const request = require("request")
const app = express.Router()

const checkToken = require(`${__dirname}/../../middleware/checkToken`)
const Athena = require(`${__dirname}/../../model/Athena`)

function getNews() {
    return new Promise((resolve, reject) => {
        try {
            request("https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game", {json: true}, (err, res, body) => {
                if (err) resolve([])
                else resolve(body.playlistinformation.playlist_info.playlists)
            })
        } catch {
            resolve([])
        }
    })
}

app.get("/api/pages/fortnite-game", async (req, res) => {
    var athena
    try {
        if (useragent.split(":")[1] == req.headers["user-agent"]) {
            athena = await Athena.findOne({id: useragent.split(":")[0]})
        }
    } catch {}

    var images = await getNews()

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
        },
        dynamicbackgrounds: {
            "jcr:isCheckedOut": true,
            backgrounds: {
                backgrounds: [
                    {
                        stage: athena ? athena.stage : undefined,
                        _type: "DynamicBackground",
                        key: "lobby"
                    },
                    {
                        stage: athena ? athena.stage : undefined,
                        _type: "DynamicBackground",
                        key: "vault"
                    }
                ],
                "_type": "DynamicBackgroundList"
            },
            _title: "dynamicbackgrounds",
            _noIndex: false,
            "jcr:baseVersion": "a7ca237317f1e71f17852c-bccd-4be6-89a0-1bb52672a444",
            _activeDate: new Date(),
            lastModified: new Date(),
            _locale: "en-US"
        },
        playlistinformation: {
            is_tile_hidden: false,
            frontend_matchmaking_header_style: "None",
            "jcr:isCheckedOut": true,
            show_ad_violator: false,
            _title: "playlistinformation",
            frontend_matchmaking_header_text: "",
            playlist_info: {
                _type: "Playlist Information",
                playlists: images
            },
            _noIndex: false,
            "jcr:baseVersion": "a7ca237317f1e753075e45-ce4a-442e-83f8-9451519dab16",
            _activeDate: "2018-04-25T15:05:39.956Z",
            lastModified: new Date(),
            _locale: "en-US"
        },
    })
})


module.exports = app