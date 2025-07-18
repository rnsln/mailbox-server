const {authJwt} = require("../middlewares");
const users = require("../controllers/user.controller");
module.exports = app => {
    const users = require('../controllers/user.controller')
    const router = require('express').Router()

    router.get('/:id', [authJwt.verifyToken], users.getOne)
    router.get('/', [authJwt.verifyToken, authJwt.isAdmin], users.findAll)
    router.post('/filtered', [authJwt.verifyToken, authJwt.isAdmin], users.findAllFiltered)

    router.post('/', [authJwt.verifyToken, authJwt.isAdmin], users.create)
    router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], users.update)
    router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], users.delete)

    router.post('/inbox/:id', [authJwt.verifyToken], users.getInbox)
    router.post('/outbox/:id', [authJwt.verifyToken], users.getOutbox)

    router.patch('/:id', [], users.patchOne)
    router.get('/search/:term', [], users.search)

    app.use('/api/users', router)
}