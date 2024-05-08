const { errorsCode } = require("../services/errors/errorsCode.js")
const logger = require("../utils/logger.js");

const handleError = (error, req, res, next) => {
    logger.error(error.cause)
    switch (error.code) {
        case errorsCode.PATH_ERROR:
            res.send({ status: "error", error: error.name, message: error.message, cause: error.cause, code: error.code })
            break
        case errorsCode.DATABASE_ERROR:
            res.send({ status: "error", error: error.name, message: error.message, cause: error.cause, code: error.code })
            break
        case errorsCode.BAD_REQUEST:
            res.send({ status: "error", error: error.name, message: error.message, cause: error.cause, code: error.code })
            break
        default:
            res.send({ status: "error", error: "unknown error", message: error.message, cause: error.cause, code: error.code })
    }
}

module.exports = handleError