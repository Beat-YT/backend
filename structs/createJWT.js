const jwt = require("jsonwebtoken")
const crypto = require("crypto")

module.exports = (grantType, accountId, displayName) => {
    if (grantType == "client_credentials") {
        return jwt.sign({
            p: crypto.randomBytes(128).toString("base64"), // i dont know, im just gonna randomly create shit here
            clsvc: "fortnite",
            t: "s",
            mver: false,
            clid: "3446cd72694c4a4485d81b77adbb2141",
            ic: true,
            exp: Math.floor(Date.now() / 1000) + (240 * 240),
            am: grantType,
            iat: Math.floor(Date.now() / 1000),
            jti: "90d0c709c3f7443fb26fe5acbf2e1126"
        }, "SlushWasHere") // TODO: replace
    } else {
        return jwt.sign({
            app: "fortnite",
            sub: accountId,
            dvid: "164fb25bb44e42c5a027977d0d5da800",
            mver: false,
            clid: "3446cd72694c4a4485d81b77adbb2141",
            dn: displayName,
            am: grantType,
            p: crypto.randomBytes(256).toString("base64"), // i dont know, im just gonna randomly create shit here
            iai: accountId,
            clsvc: "fortnite",
            t: "s",
            ic: true,
            exp: Math.floor(Date.now() / 1000) + (480 * 480),
            iat: Math.floor(Date.now() / 1000),
            jti: "3f0988abb6e642d2b071df411f1bad9b"
        }, "SlushWasHere") // TODO: replace
    }
}