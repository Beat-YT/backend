const WebSocket = require('ws');
const Client = require("./Client")
const wss = new WebSocket.Server({ port: 80 });

wss.on("connection", ws => {
    console.log("connected")
    var client = new Client(ws)

    ws.on("close", () => {
        if (client.accountId) {
            if (xmppClients.find(x => x.id = client.accountId)) xmppClients.splice(xmppClients.findIndex(x => x.id == client.accountId), 1)
        }
    })
})

wss.on("error", ws => {
    console.log("closed")
})