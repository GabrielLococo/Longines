const CartModel = require("../models/cart.model.js")

class CartRepository {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] })
            await newCart.save()
            return newCart
        } catch (error) {
            throw new Error("Error")
        }
    }
    
    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                console.log("id product doesn't exist .getCartById")
                return null
            }
            return cart
        } catch (error) {
            throw new Error("Error getting cart cart.repository")
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.getCartById(cartId) 
            const existeProducto = cart.products.find(item => item.product._id.toString() === productId)

            if (existeProducto) {
                existeProducto.quantity += quantity
            } else {
                cart.products.push({ product: productId, quantity })
            }
            cart.markModified("products")
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error addProductToCart")
        }
    }

    async deletingProduct(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                throw new Error('Cart not found')
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId)
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error deleting product . deletingProduct")
        }
    }

    async updateProductsOnCart(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                throw new Error('Cart not found')
            }

            cart.products = updatedProducts

            cart.markModified('products')
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error updating products on cart ")
        }
    }

    async updateAmountOnCart(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                
                throw new Error('Cart not found updateAmountOnCart')
            }
            
            
            const productIndex = cart.products.findIndex(item => item._id.toString() === productId)
        
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity


                cart.markModified('products')

                await cart.save()
                return cart
            } else {
                throw new Error('Product not found in cart  updateAmountOnCart')
            }

        } catch (error) {
            throw new Error("Error updating quantity  updateAmountOnCart")
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
                throw new Error('Cart not found emptyCart')
            }

            return cart

        } catch (error) {
            throw new Error("Error emptyCart")
        }
    }
}

module.exports = CartRepository



