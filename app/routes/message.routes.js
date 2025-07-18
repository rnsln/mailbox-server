const {authJwt} = require("../middlewares");
const messages = require("../controllers/message.controller");
module.exports = app => {
    const messages = require('../controllers/message.controller')
    const router = require('express').Router()
    router.get('/:id', [authJwt.verifyToken], messages.findOne)
    router.post('/', [authJwt.verifyToken], messages.create)
    router.delete('/:id', [authJwt.verifyToken], messages.delete)
    app.use('/api/messages', router)
}