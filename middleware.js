function createAuthFailed(endpoint) {
    return {
        "errorCode": "errors.com.epicgames.common.authentication.authentication_failed",
        "errorMessage": `Authentication failed for ${endpoint}`,
        "messageVars": [
            endpoint
        ],
        "numericErrorCode": 1032,
        "originatingService": "com.epicgames.account.public",
        "intent": "prod"
      }
}

module.exports = {

    //checks if a token is valid
    checkToken(req, res, next) {
        if (!req.headers.authorization) res.status(401).json(createAuthFailed(req.originalUrl.replace("/account", "")))
    }
}