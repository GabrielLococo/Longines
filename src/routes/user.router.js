const express = require("express")
const router = express.Router()
const passport = require("passport")
const UserController = require("../controllers/user.controller.js")
const userController = new UserController()
const logger = require("../utils/logger.js")
const checkUserRole = require("../middleware/checkrole.js")
const UserModel = require("../models/user.model.js")
const ViewsController = require("../controllers/view.controller.js")
const viewsController = new ViewsController()

router.post("/register", userController.register)
router.post("/login", userController.login)
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile)
router.post("/logout", userController.logout.bind(userController))
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin)
router.post("/requestPasswordReset", userController.requestPasswordReset)
router.post('/reset-password', userController.resetPassword)
router.put("/premium/:uid", userController.changeRolPremium)

const upload = require("../middleware/multer.js")
const UserRepository = require("../repositories/user.repository.js")
const userRepository = new UserRepository()


router.post("/premium/:uid", checkUserRole(['admin']), passport.authenticate('jwt', { session: false }), userController.changeRolPremium)

router.post('/:uid/documents', upload.fields([
    { name: 'document' }, { name: 'products' }, { name: 'profile' }]), async (req, res) => {
        const { uid } = req.params
        const uploadedDocuments = req.files

        try {
            const user = await userRepository.findById(uid)

            if (!user) {
                return res.status(404).send("User not found.")
            }

            if (uploadedDocuments) {
                if (uploadedDocuments.document) {
                    user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })))
                }
                if (uploadedDocuments.products) {
                    user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path 
                    })))
                }
                if (uploadedDocuments.profile) {
                    user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path 
                    })))
                }
            }

           
            await user.save()

            res.status(200).send("Documents upload ok")
        } catch (error) {
            logger.error(error)
            res.status(500).send('Server error')
        }
    })

router.get("/",checkUserRole(['admin']), passport.authenticate('jwt', { session: false }), viewsController.renderUsers)
router.delete("/delete_user/:uid",checkUserRole(['admin']), passport.authenticate('jwt', { session: false }), userController.deleteUser)
router.delete("/",checkUserRole(['admin']), passport.authenticate('jwt', { session: false }), userController.deleteOldUsers)


module.exports = router

