const UserModel = require("../models/user.model.js")
const CartModel = require("../models/cart.model.js")
const jwt = require("jsonwebtoken")
const { createHash, isValidPassword } = require("../utils/hashbcryp.js")
const UserDTO = require("../dto/user.dto.js")


class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body
        try {
            const existUser = await UserModel.findOne({ email })
            if (existUser) {
                return req.logger.warning('user already exist'),
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

            req.logger.info('user register ok')
            res.redirect("/api/users/profile")
        } catch (error) {
            req.logger.error('server error register')
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
            req.logger.info('user login ok')
            res.redirect("/api/users/profile")
        } catch (error) {
            console.error(error)
            req.logger.error('server error login')
            res.status(500).send("server error login")
        }
    }

    async profile(req, res) {
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role)
        const isAdmin = req.user.role === 'admin'
        res.render("profile", { user: userDto, isAdmin })
    }

    async logout(req, res) {
        req.logger.info('logout ok')
        res.clearCookie("lococotokencookie")
        res.redirect("/login")
    }

    async admin(req, res) {
        if (req.user.user.role !== "admin") {
            return res.status(403).send("access not alowed. only for admins."),
            req.logger.warning('access not alowed. only for admins.')
        }
        req.logger.info('user admin login ok')
        res.render("admin")
    }
}

module.exports = UserController
