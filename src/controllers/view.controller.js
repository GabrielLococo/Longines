const ProductModel = require("../models/product.model.js")
const CartRepository = require("../repositories/cart.repository.js")
const cartRepository = new CartRepository()
const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const TicketRepository= require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();
const UserModel = require("../models/user.model.js");


class ViewsController {
    async renderProducts(req, res) {
        try {
            const { page = 1, limit = 3 } = req.query

            const skip = (page - 1) * limit

            const products = await ProductModel
                .find()
                .skip(skip)
                .limit(limit)

            const totalProducts = await ProductModel.countDocuments()
            const totalPages = Math.ceil(totalProducts / limit)
            const hasPrevPage = page > 1
            const hasNextPage = page < totalPages

            const nuevoArray = products.map(producto => {
                const { _id, ...rest } = producto.toObject()
                return { id: _id, ...rest }
            })
            const cartId = req.user.cart.toString()

            res.render("products", {
                products: nuevoArray,
                hasPrevPage,
                hasNextPage,
                prevPage: page > 1 ? parseInt(page) - 1 : null,
                nextPage: page < totalPages ? parseInt(page) + 1 : null,
                currentPage: parseInt(page),
                totalPages,
                cartId
            })
        } catch (error) {
            req.logger.error("error getting products renderProducts", error)
            res.status(500).json({
                status: 'error',
                error: "server error renderProducts"
            })
        }
    }

    async renderCart(req, res) {
        const cartId = req.params.cid
        try {
            const carrito = await cartRepository.getCartById(cartId)

            if (!carrito) {
                req.logger.warning("that cart ID doesn't exist")
                return res.status(404).json({ error: "cart not find. renderCart" })
            }

            let totalBuy = 0

            const productsInCart = carrito.products.map(item => {
                const product = item.product.toObject()
                const quantity = item.quantity
                const totalPrice = product.price * quantity

                
                totalBuy += totalPrice

                return {
                    product: { ...product, totalPrice },
                    quantity,
                    cartId
                }
            })

            res.render("carts", { products: productsInCart, totalBuy, cartId })
        } catch (error) {
            req.logger.error("Error getting cart renderCart", error)
            res.status(500).json({ error: "server error renderCart" })
        }
    }

    async renderLogin(req, res) {
        res.render("login")
    }

    async renderRegister(req, res) {
        res.render("register")
    }

    async renderRealTimeProducts(req, res) {
        try {
            res.render("realtimeproducts")
        } catch (error) {
            req.logger.error("error on RTproducts view", error)
            res.status(500).json({ error: "server error renderRealTimeProducts" })
        }
    }

    async renderChat(req, res) {
        res.render("chat")
    }

    async renderHome(req, res) {
        res.render("home")
    }

    async renderPurchase(req, res) {
        try {
          console.log('>>>  RENDER PURCHASE TICKETBUY')
          console.log('>>>  req.params.cid:' + req.params.cid)
          console.log('>>>  req.params.tid:' + req.params.tid)
          const cart = await cartRepository.getCartById(req.params.cid)
          const ticket = await ticketRepository.getTicketById(req.params.tid)
          const purchaser = await UserModel.findById(ticket.purchaser)
          const products = cart.products
          const cartInfo =
            ' sorry, out of stock for now'
          const title = 'buy finished'
          const hasTicket = true
    
          if (!req.params.tid) {
            req.logger.error('ticket id is not defined')
          }
    
          res.render('carts', {
            products,
            cart,
            ticket,
            title,
            cartInfo,
            purchaser,
            hasTicket,
          });
        } catch (error) {
          req.logger.error('error trying to render buy :', error);
          res.status(500).json({ error: 'server error renderPurchase' });
        }
      }
}

module.exports = ViewsController
