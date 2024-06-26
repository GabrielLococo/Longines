const TicketModel = require("../models/ticket.model.js")
const UserModel = require("../models/user.model.js")
const CartRepository = require("../repositories/cart.repository.js")
const cartRepository = new CartRepository()
const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const { generateUniqueCode, calculateTotal } = require("../utils/cartutils.js")
const logger = require("../utils/logger.js")
const EmailManager = require("../services/email.js")
const emailManager = new EmailManager()




class CartController {
    async newCart(req, res) {
        try {
            const newCart = await cartRepository.createCart()
            res.status(200).json(newCart);
        } catch (error) {
            res.status(500).send("server error newCart")
            logger.error('server error newCart ', error)
        }
    }

    async getProductsFromCart(req, res) {
        const carritoId = req.params.cid
        try {
            const products = await cartRepository.getCartById(carritoId)
            if (!products) {
                logger.warning('cart not found')
                return res.status(404).json({ error: "cart not found" })
            }
            res.status(200).json(products)
        } catch (error) {
            logger.error('server error getProductsFromCart', error)
            res.status(500).send("server error getProductsFromCart ")
        }
    }

    async addProductToCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        const quantity = req.body.quantity || 1
        const userId = req.user._id
        
        try {
            const user = await UserModel.findById(userId)
            if (user.role === 'premium') { 
                const product = await productRepository.gettingProdById(productId)
                if (!product) {
                    return res.status(404).json({ error: "Product not found" })
                }
                if (product.owner === user.email)  {
                    return res.status(403).json({ error: "You cannot add a product that you created yourself" })
                }
            }

            const cart = await cartRepository.getCartById(cartId);
                if (!cart) {
                return res.status(404).json({ error: "Cart not found" });
            }

            await cartRepository.addProductToCart(cartId, productId, quantity)
            const carritoID = (req.user.cart).toString()

            res.redirect(`/carts/${carritoID}`)
        } catch (error) {
            logger.error('server error addproducttocart', error)
            res.status(500).send({ status: "server error addProductToCart", error: error })
        }
    }

    async deleteProductFromCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        try {
            const updatedCart = await cartRepository.deletingProduct(cartId, productId)
            res.status(200).json({
                status: 'success',
                message: 'deleteProductFromCart success ok',
                updatedCart,
            })
        } catch (error) {
            res.status(500).send("server error deleteProductFromCart")
            logger.error('server error deleteProductFromCart', error)
        }
    }

    async updateProductsOnCart(req, res) {
        const cartId = req.params.cid
        const updatedProducts = req.body
        try {
            const updatedCart = await cartRepository.updateProductsOnCart(cartId, updatedProducts)
            res.status(200).json(updatedCart)
        } catch (error) {
            res.status(500).send("server error updateProductsOnCart")
            logger.error('server error updateProductsOnCart', error)
        }
    }

    async updateAmount(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.updateAmountOnCart(cartId, productId, newQuantity)

            res.status(200).json({
                status: 'success',
                message: 'quantity product update ok ',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("server error updateAmount ",error)
        }
    }

    async emptyCart(req, res) {
        const cartId = req.params.cid
        try {
            const updatedCart = await cartRepository.emptyCart(cartId)

            res.status(200).json({
                status: 'success',
                message: 'detele products from cart success ok',
                updatedCart,
            })

        } catch (error) {
            res.status(500).send("server error emptyCart")
            logger.error('server error emptyCart', error)
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

            await emailManager.sendEmailBuy(userWithCart.email, userWithCart.first_name, ticket._id)

            res.render("checkout", {
                cliente: userWithCart.first_name,
                email: userWithCart.email,
                numTicket: ticket._id 
            })


        } catch (error) {
            logger.error('server error. Error procesing buy:', error)
            res.status(500).json({ error: 'server error endBuy' })
        }
    }

}

module.exports = CartController

