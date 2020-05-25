const express = require("express")
const app = express.Router()

var monog = {}

const {checkToken} = require("./middleware")

function createMethodError() {
    return {
        "errorCode": "errors.com.epicgames.common.method_not_allowed",
        "errorMessage": "Sorry the resource you were trying to access cannot be accessed with the HTTP method you used.",
        "numericErrorCode": 1009,
        "originatingService": "com.epicgames.account.public",
        "intent": "prod"
    }
}

app.all("/api/oauth/token", (req, res) => {
    if (req.method != "POST") return res.status(405).json(createMethodError())

    switch (req.body.grant_type) {
        case "password":
            res.json({
                "access_token": "64cfd52acdfd02ca9dda7d6846fdd60f49216da5d817ec677892fd26aa1b6a88",
                "expires_in": 28800,
                "expires_at": "9999-12-31T23:59:59.999Z",
                "token_type": "bearer",
                "refresh_token": "cd581d37b0434726a37b0268bb99206c",
                "refresh_expires": 115200,
                "refresh_expires_at": "9999-12-31T23:59:59.999Z",
                "account_id": "me",
                "client_id": "3446cd72694c4a4485d81b77adbb2141",
                "internal_client": true,
                "client_service": "fortnite",
                "displayName": "me",
                "app": "fortnite",
                "in_app_id": "me",
                "device_id": "164fb25bb44e42c5a027977d0d5da800"
            })
            break;
        default: 
            res.status(400).json({
                errorCode: "errors.com.epicgames.common.oauth.unsupported_grant_type",
                errorMessage: `Unsupported grant type: ${req.body.grant_type}`,
                messageVars: [],
                numericErrorCode: 1016,
                originatingService: "com.epicgames.account.public",
                intent: "prod",
                error_description: `Unsupported grant type: ${req.body.grant_type}`,
                error: "unsupported_grant_type"
            })
    }
})

// tokenx
app.use(checkToken)

module.exports = app