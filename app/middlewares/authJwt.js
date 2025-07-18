const jwt = require('jsonwebtoken')
const config = require('../config/auth.config')
const db = require('../models')

const User = db.users
const Role = db.roles

verifyToken = (req, res, next) => {
    let token = req.headers.authorization.split(' ')[1]

    if(!token)
        return res.status(403).send({message: 'No token provided!'})

    jwt.verify(token,
        config.secret,
        async (err, decoded) => {
            if (err) {
                return res.status(401).send({message: 'Unauthorized!'})
            }

           User.findOne({_id: decoded.id}).then( user => {
               if(!user){
                   res.status(403).send({message: 'No such user. Please log out.'})
                   return
               }
               req.userId=user.id
               next()
               }
           )
        })
}

isAdmin = (req, res, next) => {
    User.findById(req.userId).then(user => {
        Role.find({
            _id: {$in: user.roles}
        }).then(roles => {
            for(let i = 0;i < roles.length; i++){
                if(roles[i].name === 'admin'){
                    next()
                    return
                }
            }

            res.status(403).send({message: 'Require admin role!'})
        }).catch(err => {
            res.status(500).send({message: err})
        })
    }).catch(err => {
        res.status(500).send({message: err})
    })
}

const authJwt = {
    verifyToken,
    isAdmin
}

module.exports = authJwt