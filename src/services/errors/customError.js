

class CustomError {
    static newError({name = 'error', cause = 'unknown', message, code = 1}) {
        const error = new Error(message)
        error.name = name
        error.cause = cause
        error.code = code
        throw error
    }
}

module.exports = CustomError