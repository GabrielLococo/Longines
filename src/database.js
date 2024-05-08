const mongoose = require('mongoose')
const configObject = require('./config/config.js')
const {mongo_url} = configObject
const logger = require("./utils/logger.js")

mongoose.connect(mongo_url)
.then(() => logger.info('conexion exitosa a mongoose '))
.catch(() => logger.error('error al conectar con mongoose '))