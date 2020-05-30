const WebSocket = require('ws');
const Client = require("./Client")

const logging = require(`${__dirname}/../structs/logs`)
const config = require(`${__dirname}/../config.json`)

const wss = new WebSocket.Server({ port: process.env.xmppPort || config.xmppPort || 443 });


wss.on("connection", ws => {
    var client = new Client(ws)

    ws.on("close", () => {
        if (client.id) {
            if (xmppClients[client.id]) delete xmppClients[client.id]
        }
    })
})

wss.on("error", ws => {})