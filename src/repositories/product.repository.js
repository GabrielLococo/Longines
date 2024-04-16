const ProductModel = require("../models/product.model.js")

class ProductRepository {
    async addingProduct({ title, description, price, img, code, stock, category, thumbnails }) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                console.log("all fields are required. addingProduct")
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
            throw new Error("Error") //change
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
            throw new Error("Error") //change
        }
    }

    async gettingProdById(id) {
        try {
            const product = await ProductModel.findById(id)

            if (!product) {
                console.log("Product not found  gettingProdById")
                return null
            }

            console.log("Product found success ok")
            return product
        } catch (error) {
            throw new Error("Error") //change
        }
    }

    async updatingProduct(id, updatedProduct) {
        try {
            const updated = await ProductModel.findByIdAndUpdate(id, updatedProduct)
            if (!updated) {
                console.log("Product not found updatingProduct")
                return null
            }

            console.log("Product upload success ok")
            return updated
        } catch (error) {
            throw new Error("Error") //change
        }
    }

    async deletingProduct(id) {
        try {
            const deleted = await ProductModel.findByIdAndDelete(id)
            if (!deleted) {
                console.log("Product not found deletingProduct")
                return null
            }
            console.log("delete product success ok deletingProduct")
            return deleted
        } catch (error) {
            throw new Error("Error")  //change
        }
    }
}

module.exports = ProductRepository