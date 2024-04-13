const mongoose = require('mongoose')
const configObject = require('./config/config.js')
const {mongo_url} = configObject

mongoose.connect(mongo_url)
.then(() => console.log('conexion exitosa a mongoose '))
.catch(() => console.log('error al conectar con mongoose '))