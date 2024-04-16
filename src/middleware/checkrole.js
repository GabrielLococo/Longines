const jwt = require('jsonwebtoken')

const checkUserRole = (allowedRoles) => (req, res, next) => {
    const token = req.cookies.lococotokencookie

    if (token) {
        jwt.verify(token, 'coderhouse', (err, decoded) => {
            if (err) {
                res.status(403).send('Denied access. invalid Token. checkUserRole')
            } else {
                const userRole = decoded.user.role
                if (allowedRoles.includes(userRole)) {
                    next()
                } else {
                    res.status(403).send('Denied access. not alowed on this page. checkUserRole')
                }
            }
        })
    } else {
        res.status(403).send('Denied access. need Token. checkUserRole ')
    }
}

module.exports = checkUserRole