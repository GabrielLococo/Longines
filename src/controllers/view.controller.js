const ProductModel = require("../models/product.model.js")
const CartRepository = require("../repositories/cart.repository.js")
const cartRepository = new CartRepository()
const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const TicketRepository= require("../repositories/ticket.repository.js")
const ticketRepository = new TicketRepository()
const UserModel = require("../models/user.model.js")
const logger = require("../utils/logger.js")
const UserDTO = require("../dto/user.dto.js")


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
            logger.error("error getting products renderProducts", error)
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
                logger.warning("that cart ID doesn't exist")
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
            logger.error("Error getting cart renderCart", error)
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
        const user = req.user 
        try {
            res.render("realtimeproducts" , {role: user.role , email: user.email}) //handlebars props 
        } catch (error) {
            logger.error("error on RTproducts view", error)
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
          logger.info('>>>  RENDER PURCHASE TICKETBUY')
          logger.info('>>>  req.params.cid:' + req.params.cid)
          logger.info('>>>  req.params.tid:' + req.params.tid)
          const cart = await cartRepository.getCartById(req.params.cid)
          const ticket = await ticketRepository.getTicketById(req.params.tid)
          const purchaser = await UserModel.findById(ticket.purchaser)
          const products = cart.products
          const cartInfo =
            ' sorry, out of stock for now'
          const title = 'buy finished'
          const hasTicket = true
    
          if (!req.params.tid) {
            logger.error('ticket id is not defined')
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
          logger.error('error trying to render buy :', error)
          res.status(500).json({ error: 'server error renderPurchase' })
        }
      }


    async renderResetPassword(req, res) {
        res.render("passwordreset")
    }

    async renderChangePassword(req, res) {
        res.render("changePassword")
    }

    async renderRestorePassOk(req, res) {
        res.render("restorePasswordOk")
    }

    async renderPremium(req, res) {
        res.render("panel-premium")
    }

    async renderUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10
            const page = parseInt(req.query.page) || 1
            const loggedInUserId = req.user._id
            const role = req.user.role

            const totalUsers = await UserModel.countDocuments({ _id: { $ne: loggedInUserId } })

            const skipCount = (page - 1) * limit;
            let criteria = [
                { $match: { _id: { $ne: loggedInUserId } } },
                { $skip: skipCount },
                { $limit: limit },
            ];

            const users = await UserModel.aggregate(criteria)
            const usersDto = users.map(user => new UserDTO(user.first_name, user.last_name, user.email, user.role, user.last_connection))

            const totalPages = Math.ceil(totalUsers / limit)
            const hasNextPage = page < totalPages
            const hasPrevPage = page > 1

            res.render("users", {
                users: usersDto,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                currentPage: page,
                hasPrevPage,
                hasNextPage,
                docs: usersDto,
                role:  req.user ? req.user.role : null,
            })

        } catch (error) {
            logger.error("Error getting users", error)
            res.status(500).json({ error: "Server Error" })
        }
    }
}

module.exports = ViewsController
