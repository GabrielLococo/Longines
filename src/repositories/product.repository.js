const ProductModel = require("../models/product.model.js")

class ProductRepository {
    async addingProduct({ title, description, price, img, code, stock, category, thumbnails }) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                console.log("Todos los campos son obligatorios")
                return
            }

            const existProduct = await ProductModel.findOne({ code: code })

            if (existProduct) {
                console.log("El código del producto debe ser único.") // tira este error al agregar un producto al REALTIME
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
            throw new Error("Error")
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
            throw new Error("Error")
        }
    }

    async gettingProdById(id) {
        try {
            const product = await ProductModel.findById(id)

            if (!product) {
                console.log("Producto no encontrado")
                return null
            }

            console.log("Producto encontrado con éxito.")
            return product
        } catch (error) {
            throw new Error("Error")
        }
    }

    async updatingProduct(id, updatedProduct) {
        try {
            const updated = await ProductModel.findByIdAndUpdate(id, updatedProduct)
            if (!updated) {
                console.log("Producto no encontrado.")
                return null
            }

            console.log("Producto actualizado con éxito.")
            return updated
        } catch (error) {
            throw new Error("Error")
        }
    }

    async deletingProduct(id) {
        try {
            const deleted = await ProductModel.findByIdAndDelete(id)
            if (!deleted) {
                console.log("No se encontró el producto.")
                return null
            }
            console.log("Producto eliminado con éxito.")
            return deleted
        } catch (error) {
            throw new Error("Error")
        }
    }
}

module.exports = ProductRepository