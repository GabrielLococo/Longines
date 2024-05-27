
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUiExpress = require("swagger-ui-express")


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

const specs = swaggerJSDoc(swaggerOptions)
module.exports = { swaggerUiExpress, specs }
