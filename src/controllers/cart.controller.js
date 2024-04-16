const TicketModel = require("../models/ticket.model.js")
const UserModel = require("../models/user.model.js")
const CartRepository = require("../repositories/cart.repository.js")
const cartRepository = new CartRepository()
const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const { generateUniqueCode, calculateTotal } = require("../utils/cartutils.js")




class CartController {
    async newCart(req, res) {
        try {
            const newCart = await cartRepository.createCart()
            res.json(newCart);
        } catch (error) {
            res.status(500).send("Error al crear carrito")
        }
    }

    async getProductFromCart(req, res) {
        const carritoId = req.params.cid
        try {
            const products = await cartRepository.getProductFromCart(carritoId)
            if (!products) {
                return res.status(404).json({ error: "Carrito no encontrado" })
            }
            res.json(products)
        } catch (error) {
            res.status(500).send("Error")
        }
    }

    async addProductToCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        const quantity = req.body.quantity || 1
        
        try {
            await cartRepository.addProductToCart(cartId, productId, quantity)
            const carritoID = (req.user.cart).toString()

            res.redirect(`/carts/${carritoID}`)
        } catch (error) {
            console.log('error addproduct' + error)
            res.status(500).send({ status: "Error", error: error })
        }
    }

    async deleteProductFromCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        try {
            const updatedCart = await cartRepository.deletingProduct(cartId, productId)
            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            })
        } catch (error) {
            res.status(500).send("Error")
        }
    }

    async updateProductsOnCart(req, res) {
        const cartId = req.params.cid
        const updatedProducts = req.body
        try {
            const updatedCart = await cartRepository.updateProductsOnCart(cartId, updatedProducts)
            res.json(updatedCart)
        } catch (error) {
            res.status(500).send("Error")
        }
    }

    async updateAmount(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.updateAmountOnCart(cartId, productId, newQuantity)

            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada ',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("Error al actualizar la cantidad de productos")
        }
    }

    async emptyCart(req, res) {
        const cartId = req.params.cid
        try {
            const updatedCart = await cartRepository.emptyCart(cartId)

            res.json({
                status: 'success',
                message: 'Productos del carrito fueron eliminados correctamente',
                updatedCart,
            })

        } catch (error) {
            res.status(500).send("Error")
        }
    }

    //finalizar compra. TICKET
    async endBuy(req, res) {
        const cartId = req.params.cid
        try {
            const cart = await cartRepository.getCartById(cartId)
            const products = cart.products
            const ProductsNotAvailable = [];

            for (const item of products) {
                const productId = item.product
                const product = await productRepository.gettingProdById(productId)
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity
                    await product.save()
                } else {
                    ProductsNotAvailable.push(productId);
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId })

            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calculateTotal(cart.products),
                purchaser: userWithCart._id
            });
            await ticket.save()

            cart.products = cart.products.filter(item => ProductsNotAvailable.some(productId => productId.equals(item.product)))
            await cart.save()

            // res.status(200).json({ ProductsNotAvailable })
            res.status(200).json({ cartId: cart._id, ticketId: ticket._id })
        } catch (error) {
            console.error('Error al procesar la compra:', error)
            res.status(500).json({ error: 'Error interno del servidor' })
        }
    }

}

module.exports = CartController

