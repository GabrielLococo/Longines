const FakerUtils = require('../utils/faker.js')
const fakerUtils = new FakerUtils()

class FakerController {
    async generateProducts(req,res) {

        const fakerProducts = []

        for (let i = 0; i < 10; i++) {
            const productsFaker = await fakerUtils.generateProduct()
            fakerProducts.push(productsFaker)
        }

        res.json(fakerProducts)
    }
}

module.exports = FakerController