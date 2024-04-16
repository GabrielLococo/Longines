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
            console.error("Error al obtener productos", error)
            res.status(500).json({
                status: 'error',
                error: "Error interno del servidor"
            })
        }
    }

    async renderCart(req, res) {
        const cartId = req.params.cid
        try {
            const carrito = await cartRepository.getCartById(cartId)

            if (!carrito) {
                console.log("No existe ese carrito con el id");
                return res.status(404).json({ error: "Carrito no encontrado" })
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
            console.error("Error al obtener el carrito", error)
            res.status(500).json({ error: "Error interno del servidor" })
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
            console.log("error en la vista real time", error)
            res.status(500).json({ error: "Error interno del servidor" })
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
          console.log('*** RENDER PURCHASE');
          console.log('** req.params.cid:' + req.params.cid);
          console.log('** req.params.tid:' + req.params.tid);
          const cart = await cartRepository.getCartById(req.params.cid);
          const ticket = await ticketRepository.getTicketById(req.params.tid);
          const purchaser = await UserModel.findById(ticket.purchaser);
          const products = cart.products;
          const cartInfo =
            ' Pendientes de compra. Sin stock por el momento';
          const title = 'Compra Finalizada';
          const hasTicket = true;
    
          if (!req.params.tid) {
            throw new Error('El ID del ticket no está definido');
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
          console.error('Error al renderizar finalizar compra:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      }
}

module.exports = ViewsController
