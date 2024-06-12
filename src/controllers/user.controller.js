const UserModel = require("../models/user.model.js")
const CartModel = require("../models/cart.model.js")
const jwt = require("jsonwebtoken")
const { createHash, isValidPassword } = require("../utils/hashbcryp.js")
const UserDTO = require("../dto/user.dto.js")
const generateProducts = require('../utils/faker.js')
const logger = require("../utils/logger.js")
const { generateResetToken } = require("../utils/tokenreset.js")
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();


class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body
        try {
            const existUser = await UserModel.findOne({ email })
            if (existUser) {
                return logger.warning('user already exist'),
                res.status(400).send("user already exist")
            }

            const newCart = new CartModel()
            await newCart.save()

            const newUser = new UserModel({
                first_name,
                last_name,
                email,
                cart: newCart._id, 
                password: createHash(password),
                age
            })

            await newUser.save()

            const token = jwt.sign({ user: newUser }, "coderhouse", {
                expiresIn: "3h"
            })

            res.cookie("lococotokencookie", token, {
                maxAge: 6000000,
                httpOnly: true
            })

            logger.info('user register ok')
            res.redirect("/api/users/profile")
        } catch (error) {
            logger.error('server error register', error)
            res.status(500).send("server error register")
        }
    }

    async login(req, res) {
        const { email, password } = req.body
        try {
            const findedUser = await UserModel.findOne({ email })

            if (!findedUser) {
                return res.status(401).send("User not valid")
            }

            const isValid = isValidPassword(password, findedUser)
            if (!isValid) {
                return res.status(401).send("not valid password")
            }

            const token = jwt.sign({ user: findedUser }, "coderhouse", {
                expiresIn: "3h"
            })

            res.cookie("lococotokencookie", token, {
                maxAge: 3600000,
                httpOnly: true
            })
            logger.info('user login ok')
            res.redirect("/api/users/profile")
        } catch (error) {
            logger.error('server error login', error)
            res.status(500).send("server error login")
        }
    }
    
    async profile(req, res) {
        try {
            const isPremium = req.user.role === 'premium';
            const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
            const isAdmin = req.user.role === 'admin';

            res.render("profile", { user: userDto, isPremium, isAdmin });
        } catch (error) {
            res.status(500).send('Server error / profile', error);
        }
    }

    async logout(req, res) {
        logger.info('logout ok')
        res.clearCookie("lococotokencookie")
        res.redirect("/login")
    }

    async admin(req, res) {
        if (req.user.user.role !== "admin") {
            return res.status(403).send("access not alowed. only for admins."),
            logger.warning('access not alowed. only for admins.')
        }
        logger.info('user admin login ok')
        res.render("admin")
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body

        try {
            const user = await UserModel.findOne({ email })
            if (!user) {
                return res.status(404).send("User not found")
            }

            const token = generateResetToken();
            user.resetToken = {
                token: token,
                expiresAt: new Date(Date.now() + 3600000) // last 1 hs 
            }
            await user.save()

            //email whit emailservice
            await emailManager.sendEmailRestorePass(email, user.first_name, token)   

            res.redirect("/restorePasswordOk")
        } catch (error) {
            logger.error(error, 'error  requestPasswordReset / user.controller.js')
            res.status(500).send("Server error /userController.js")
        }
    }

    async resetPassword(req, res) {
        const { email, password, token } = req.body
        try {
            const user = await UserModel.findOne({ email })
            if (!user) {
                return res.render("changePassword", { error: "User not found" })
            }

            //Get the user's password reset token
            const resetToken = user.resetToken
            if (!resetToken || resetToken.token !== token) {
                return res.render("passwordreset", { error: "Password reset token is invalid" })
            }

            // Check if the token has expired
            const now = new Date()
            if (now > resetToken.expiresAt) {
                return res.redirect("/changePassword");
            }

            //Check if the new password is the same as the previous one
            if (isValidPassword(password, user)) {
                return res.render("changePassword", { error: "The new password cannot be the same as the previous one" })
            }

            // Update user password
            user.password = createHash(password)
            user.resetToken = undefined // Mark the token as used
            await user.save()

            // Render password change confirmation view
            return res.redirect("/login")
        } catch (error) {
            logger.error(error)
            return res.status(500).render("passwordreset", { error: "Server error" })
        }
    }

    async changeRolPremium(req, res) {
        try {
            const { uid } = req.params
            const user = await UserModel.findById(uid)
            if (!user) {
                return res.status(404).json({ message: 'user not found' })
            }
            
            const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta']
            const userDocuments = user.documents.map(doc => doc.name)

            const hasRequiredDocuments = requiredDocuments.every(doc => userDocuments.includes(doc))

            if (!hasRequiredDocuments) {
                return res.status(400).json({ message: 'El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta' })
            }

            const newRol = user.role === 'user' ? 'premium' : 'user'
    
            const refreshed = await UserModel.findByIdAndUpdate(uid, { role: newRol }, { new: true })
            res.json(refreshed)
            
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Server Error' })
        }
    }
}

module.exports = UserController
