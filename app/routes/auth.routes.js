const {verifySignUp, authJwt} = require('../middlewares')
const controller = require('../controllers/auth.controller')

module.exports = app => {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
        next()
    })

    app.post('/api/auth/signup', [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted],
        controller.signup)

    app.post('/api/auth/signout', controller.signout)
    app.post('/api/auth/signin', controller.signin)
    app.get('/api/auth/admin', [authJwt.verifyToken], controller.isadmin)
}