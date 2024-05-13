const socket = require("socket.io")
const ProductRepository = require("../repositories/product.repository.js")
const productRepository = new ProductRepository()
const MessageModel = require("../models/message.model.js")

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer)
        this.initSocketEvents()
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
            logger.info("Un cliente se conectó")  
            
            socket.emit("products", await productRepository.gettingProduct() )

            socket.on("deletingProduct", async (id) => {
                await productRepository.deletingProduct(id)
                this.emitUpdatedProducts(socket)
            })

            socket.on("addingProduct", async (producto) => {
                await productRepository.addingProduct(producto)
                this.emitUpdatedProducts(socket)
            })

            socket.on("message", async (data) => {
                await MessageModel.create(data)
                const messages = await MessageModel.find()
                socket.emit("message", messages)
            })
        })
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productRepository.gettingProduct())
    }
}

module.exports = SocketManager
