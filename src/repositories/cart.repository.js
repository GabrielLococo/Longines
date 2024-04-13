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

    async getProductFromCart(idCarrito) {
        try {
            const carrito = await CartModel.findById(idCarrito)
            if (!carrito) {
                console.log("No existe ese carrito con el id")
                return null
            }
            return carrito
        } catch (error) {
            throw new Error("Error")
        }
    }

    async addingProduct(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.addProductFromCart(cartId)
            const existeProducto = carrito.products.find(item => item.product._id.toString() === productId)

            if (existeProducto) {
                existeProducto.quantity += quantity
            } else {
                carrito.products.push({ product: productId, quantity })
            }
            carrito.markModified("products")
            await carrito.save()
            return carrito
        } catch (error) {
            throw new Error("Error")
        }
    }

    async deletingProduct(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                throw new Error('Carrito no encontrado')
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId)
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error")
        }
    }

    async updateProductsOnCart(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                throw new Error('Carrito no encontrado')
            }

            cart.products = updatedProducts

            cart.markModified('products')
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error")
        }
    }

    async updateAmountOnCart(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId)

            if (!cart) {
                
                throw new Error('Carrito no encontrado')
            }
            
            
            const productIndex = cart.products.findIndex(item => item._id.toString() === productId)
        
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity


                cart.markModified('products')

                await cart.save()
                return cart
            } else {
                throw new Error('Producto no encontrado en el carrito')
            }

        } catch (error) {
            throw new Error("Error al actualizar las cantidades")
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
                throw new Error('Carrito no encontrado')
            }

            return cart

        } catch (error) {
            throw new Error("Error")
        }
    }
}

module.exports = CartRepository



