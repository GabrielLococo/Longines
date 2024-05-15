const nodemailer = require('nodemailer')
const logger = require("../utils/logger.js")

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: "gabriellococosi@gmail.com",
                pass: "zcco jspu czui qoub"
            }
        })
    }

    async sendEmailBuy(email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Coder Test <gabriellococosi@gmail.com>",
                to: email,
                subject: 'buy succefull',
                html: `
                    <h1>Buy succefull</h1>
                    <p>Thanks for buying!, ${first_name}!</p>
                    <p>Your order number is:  ${ticket}</p>
                `
            }

            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            logger.error('Error sending email //sendEmailBuy . services/email.js', error) // error finalizacion de compra
        }
    }

    async sendEmailRestorePass(email, first_name, token) {
        try {
            const mailOptions = {
                from: 'gabriellococosi@gmail.com',
                to: email,
                subject: 'Restore Password',
                html: `
                    <h1>Restore Password</h1>
                    <p>Hi ${first_name},</p>
                    <p>You have requested to reset your password. Use the following code to change your password:</p>
                    <p><strong>${token}</strong></p>
                    <p>This code will expire in 1 hour </p>
                    <a href="http://localhost:8080/password">Restore password</a>
                    <p>If you did not request this reset, please ignore this email.</p>
                `
            }

            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            logger.error("Error sending Email: sendEmailRestorePass ", error)
            throw new Error("Error sending Email. sendEmailRestorePass")
        }
    }
}

module.exports = EmailManager
