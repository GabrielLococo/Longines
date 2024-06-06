const express = require("express")
const router = express.Router()
const CartController = require("../controllers/cart.controller.js")
const authMiddleware = require("../middleware/authmiddleware.js")
const cartController = new CartController()

router.use(authMiddleware)

router.post("/", cartController.newCart)
router.get("/:cid", cartController.getProductsFromCart)
router.post("/:cid/product/:pid", cartController.addProductToCart)
router.delete('/:cid/product/:pid', cartController.deleteProductFromCart)
router.put('/:cid', cartController.updateProductsOnCart)
router.put('/:cid/product/:pid', cartController.updateAmount)
router.delete('/:cid', cartController.emptyCart)
router.post('/:cid/purchase', cartController.endBuy)


module.exports = router
