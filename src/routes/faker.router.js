const express = require("express")
const router = express.Router()

module.exports = (fakerController) => {
    // Ruta GET /mockingproducts - se generan 100 productsos de manera aleatoria
    router.get('/', fakerController.generateProducts)

    return router
}