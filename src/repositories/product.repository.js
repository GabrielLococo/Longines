const ProductModel = require("../models/product.model.js")
const CustomError = require('../services/errors/customError.js')
const customError = new CustomError()
const ErrorsInfo = require('../services/errors/errorsInfo.js')
const errorsInfo = new ErrorsInfo()
const { errorsCode } = require("../services/errors/errorsCode.js")

class ProductRepository {
    async addingProduct({ title, description, price, img, code, stock, category, thumbnails }) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                req.logger.warning('all fields are required')
                return
            }

            const existProduct = await ProductModel.findOne({ code: code })

            if (existProduct) {
                console.log("product code must be unique. addingProduct . product.repository") // tira este error al agregar un producto al REALTIME
                return
            }

            const newProduct = new ProductModel({
                title,
                description,
                price,
                img,
                code,
                stock,
                category,
                status: true,
                thumbnails: thumbnails || []
            })
            await newProduct.save()
            return newProduct

        } catch (error) {
            req.logger.error('error addingProduct')
        }
    }

    async gettingProduct(limit = 10, page = 1, sort, query) {
        try {
            const skip = (page - 1) * limit
            let queryOptions = {}

            if (query) {
                queryOptions = { category: query }
            }
            const sortOptions = {}

            if (sort) {
                if (sort === 'asc' || sort === 'desc') {
                    sortOptions.price = sort === 'asc' ? 1 : -1
                }
            }

            const products = await ProductModel
                .find(queryOptions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)

            const totalProducts = await ProductModel.countDocuments(queryOptions)
            const totalPages = Math.ceil(totalProducts / limit)
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
            
            return {
                docs: products,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
                nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
            }
        } catch (error) {
            req.logger.error('error gettingProduct')
        }
    }

    async gettingProdById(id) {
        try {
            const productId = req.params.pid
            const product = await ProductModel.findById(id)
            

            if (!product) {
                customError.createError({
                    name: "Id not found",
                    cause: errorsInfo.productIdNotFound({ productId }),
                    message: "Error getting the product",
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                res.json({ message: "Product found:", product })
            }
        } catch (error) {
            req.logger.error('error gettingProdById')
        }
    }

    async updatingProduct(id, updatedProduct) {
        try {
            const productId = req.params.pid
            const updated = await ProductModel.findByIdAndUpdate(id, updatedProduct)
            if (!updated) {
                customError.createError({
                    name: "Id not found",
                    cause: errorsInfo.productIdNotFound({ productId }),
                    message: "Error getting the product",
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                req.logger.info("Product upload success ok")
                return updated
            }
        } catch (error) {
            req.logger.error("Error updatingProduct") 
        }
    }

    async deletingProduct(id) {
        try {
            const productId = req.params.pid
            const deleted = await ProductModel.findByIdAndDelete(id)
            if (!deleted) {
                customError.createError({
                    name: "Id not found",
                    cause: errorsInfo.productIdNotFound({ productId }),
                    message: "Error getting the product",
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                req.logger.info("delete product success ok deletingProduct")
                return deleted
            }   
        } catch (error) {
            req.logger.error('error deletingProduct')
        }
    }
}

module.exports = ProductRepository