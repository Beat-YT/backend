const config = require(`${__dirname}/../config.json`)
const request = require("request")
const cache = {
    cosmetichash: null,
    keychainhash: null
}



function download() {
    setInterval(() => {})
}

function getCosmetics() {
    return new Promise((resolve, reject) => {
        request.get(config.cosmeticsUrl, (err, res) => {
            if (err) reject(err)

            resolve(JSON.parse(res.body))
        })
    })
}

function getKeychain() {
    return new Promise((resolve, reject) => {
        request.get(config.keychainUrl, (err, res) => {
            if (err) reject(err)

            resolve(JSON.parse(res.body))
        })
    })
}



module.exports = () => {
    setInterval(() => download, 900000)
    return cache
}