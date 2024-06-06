const CartModel = require("../models/cart.model.js")
const logger = require("../utils/logger.js")

class CartRepository {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] })
            await newCart.save()
            return newCart
        } catch (error) {
            logger.error("Error createCart" , error)
        }
    }
    
    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                req.logger.error("id product doesn't exist .getCartById")
                return null
            }
            return cart
        } catch (error) {
            logger.error("Error getting cart cart.repository" , error)
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.getCartById(cartId) 
            const existProduct = cart.products.find(item => item.product._id.toString() === productId)

            if (existProduct) {
                existProduct.quantity += quantity
            } else {
                cart.products.push({ product: productId, quantity })
            }
            cart.markModified("products")
            await cart.save()
            return cart
        } catch (error) {
            logger.error("Error addProductToCart" , error)
        }
    }

    async deletingProduct(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                logger.error('Cart not found')
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId)
            await cart.save()
            return cart
        } catch (error) {
            logger.error("Error deleting product . deletingProduct" , error)
        }
    }

    async updateProductsOnCart(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                logger.error('Cart not found')
            }

            cart.products = updatedProducts

            cart.markModified('products')
            await cart.save()
            return cart
        } catch (error) {
            logger.error("Error updating products on cart " , error)
        }
    }

    async updateAmountOnCart(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                logger.error('Cart not found updateAmountOnCart')
            }
            
            const productIndex = cart.products.findIndex(item => item.product.equals(productId))
        
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity


                cart.markModified('products')

                await cart.save()
                return cart
            } else {
                logger.error('Product not found in cart  updateAmountOnCart')
            }

        } catch (error) {
            logger.error("Error updating quantity  updateAmountOnCart", error)
        }
    }

    async emptyCart(cartId) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            )

            if (!cart) {
                logger.error('Cart not found emptyCart')
            }

            return cart

        } catch (error) {
            logger.error("Error emptyCart",error)
        }
    }
}

module.exports = CartRepository



