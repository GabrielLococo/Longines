const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const logger = require("../utils/logger.js")

class ProductController {

    async addProduct(req, res) {
        const newProduct = req.body
        try {
            const result = await productRepository.addingProduct(newProduct)
            res.status(200).json(result)
        } catch (error) {
            logger.info('server error addProduct',error)
            res.status(500).send("server error addProduct")
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query
            const product = await productRepository.gettingProduct(limit, page, sort, query)
            res.status(200).json(product)
        } catch (error) { 
            logger.info('server error getProducts',error)
            res.status(500).send("server error getProducts")
        }
    }

    async getProductById(req, res) {
        const id = req.params.pid
        try {
            const searched = await productRepository.gettingProdById(id)
            if (!searched) {
                return res.status(404).json({
                    error: "Product not find getProductById"
                });
            }
            res.status(200).json(searched)
        } catch (error) {
            logger.info('server error getProductById',error)
            res.status(500).send("server error getProductById")
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid
            const updatedProduct = req.body
            const res = await productRepository.updatingProduct(id, updatedProduct)
            res.status(200).json(res)
        } catch (error) {
            logger.info('server error updateProduct',error)
            res.status(500).send("server error updateProduct")
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid
        try {
            let res = await productRepository.deletingProduct(id)
            res.status(200).json(res)
        } catch (error) {
            logger.info('server error deleteProduct',error)
            res.status(500).send("server error deleteProduct")
        }
    }
}

module.exports = ProductController