const winston = require('winston')
const configObject = require('../config/config.js')
const {node_env} = configObject


const levels = {
    level: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}


//logger Desarrollo
const loggerDev = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                    winston.format.colorize({colors: levels.colors}),
                    winston.format.simple()
                )
        })
    ]

})

//logger Produccion
const loggerProd = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.File({
            filename: './errors.log',
            level: 'info',
            format: winston.format.simple()
        })
    ]
})

//eleccion de entorno
const logger = node_env === 'produccion' ? loggerProd : loggerDev


//middleware

module.exports = logger