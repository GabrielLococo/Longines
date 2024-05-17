const express = require("express")
const app = express()
const exphbs = require("express-handlebars")
const cookieParser = require("cookie-parser")
const passport = require("passport")
const initializePassport = require("./config/passport.config.js")
const cors = require("cors")
const path = require('path')
const PORT = 8080
require("./database.js")
const FakerController = require('./controllers/faker.controller.js')
const logger = require("./utils/logger.js");
const productsRouter = require("./routes/products.router.js")
const cartsRouter = require("./routes/carts.router.js")
const viewsRouter = require("./routes/views.router.js")
const userRouter = require("./routes/user.router.js")

//logger
const addLogger = require('./middleware/logger-middleware.js')

//handleError
const handleError = require('./middleware/handleError.js')

//MIDDLEWARES
const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
})
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

//logger middleware
app.use(addLogger)

//handleError middleware
app.use(handleError)

//PASSPORT
app.use(passport.initialize())
initializePassport()
app.use(cookieParser())

//AUTHMIDDLEWARES
const authMiddleware = require("./middleware/authmiddleware.js")
app.use(authMiddleware)

//HANDLEBARS
app.engine("handlebars", hbs.engine)  //-- ***  ",exphbs.engine() "  asi estaba antes.  
app.set("view engine", "handlebars")
app.set("views", "./src/views")

//ROUTES
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/api/users", userRouter)
app.use("/", viewsRouter)

//rutas de logger test
app.get('/loggertest',(req, res) =>{
    logger.error('error message')
    logger.debug('debug message')
    logger.info('info message')
    logger.warning('warning message')
    send('logs test')
})

//mocking faker
const fakerController = new FakerController()
app.use('/mockingproducts', require('./routes/faker.router.js')(fakerController))

//swagger
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUiExpress = require("swagger-ui-express")
//swagger config
const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Longines",
            description: "Longines e-commerce"
        }
    },
    apis: ["./src/docs/**/*.yaml"]
}

const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));


//server listener
const httpServer = app.listen(PORT, () => {
    logger.info(`SV listening http://localhost:${PORT}`)
})

const SocketManager = require("./sockets/socketmanager.js")
new SocketManager(httpServer)

