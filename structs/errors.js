module.exports = {
    create(code, numericCode, message, service, intent, vars) {
        return {
            errorCode: code,
            errorMessage: message,
            messageVars: vars || null,
            numericErrorCode: numericCode,
            originatingService: service,
            intent: intent
        }
    },

    method(service) {
        return this.create(
            "errors.com.epicgames.common.method_not_allowed", 1009,
            "Sorry the resource you were trying to access cannot be accessed with the HTTP method you used.",
            service, ""
        )
    }
}