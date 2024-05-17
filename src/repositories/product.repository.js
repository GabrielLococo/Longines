const ProductModel = require("../models/product.model.js")
const CustomError = require('../services/errors/customError.js')
const ErrorsInfo = require('../services/errors/errorsInfo.js')
const errorsInfo = new ErrorsInfo()
const { errorsCode } = require("../services/errors/errorsCode.js")
const logger = require("../utils/logger.js")

class ProductRepository {
    async addingProduct({ title, description, price, img, code, stock, category, thumbnails, owner }) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                logger.warning('all fields are required')
                return
            }

            const existProduct = await ProductModel.findOne({ code: code })

            if (existProduct) {
                logger.warning("product code must be unique. addingProduct . product.repository")
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
                thumbnails: thumbnails || [],
                owner
            })
            await newProduct.save()
            return newProduct

        } catch (error) {
            logger.error('error addingProduct', error)
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
            logger.error('error gettingProduct')
        }
    }

    async gettingProdById(id) {
        try {
            const product = await ProductModel.findById(id)

            if (!product) {
                throw CustomError.createError({
                    name: "Id not found",
                    cause: errorsInfo.productIdNotFound(id),
                    message: "Error getting the product",
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                return product
            }
        } catch (error) {
            logger.error('error gettingProdById', error)
        }
    }

    async updatingProduct(id, updatedProduct) {
        try {
            const updated = await ProductModel.findByIdAndUpdate(id, updatedProduct)
            if (!updated) {
                throw CustomError.createError({
                    name: 'Id not found',
                    cause: errorsInfo.productIdNotFound(id),
                    message: 'Error getting the product',
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                logger.info('Product upload success ok')
                return updated
            }
        } catch (error) {
            logger.error('Error updatingProduct', error) 
        }
    }

    async deletingProduct(id) {
        try {
            const deleted = await ProductModel.findByIdAndDelete(id)
            if (!deleted) {
                throw CustomError.createError({
                    name: 'Id not found',
                    cause: errorsInfo.productIdNotFound(id),
                    message: 'Error getting the product',
                    code: errorsCode.BAD_REQUEST
                })
            } else {
                logger.info('delete product success ok deletingProduct')
                return deleted
            }   
        } catch (error) {
            logger.error('error deletingProduct', error)
        }
    }
}

module.exports = ProductRepository