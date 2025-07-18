const config = require('../config/auth.config')
const db = require('../models')
const User = db.users
const Role = db.roles

var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        email: req.body.email,
        name: '',
        lastname: '',
        birthdate: null,
        city: '',
        gender: '',
    })

    user.save(user).then(data => {
        if(req.body.roles) {
            Role.find({
                name: {$in : req.body.roles}
            }).then(roles => {
                user.roles = roles.map(role => role._id)
                user.save(user).then(data => {
                    res.send({message : 'User was registered successfully!'})
                }).catch(err => {
                    res.status(500).send({message: err})
                })
            }).catch(err => {
                res.status(500).send({message: err})
            })
        } else {
            Role.findOne({name: 'user'}).then(role => {
                user.roles = [role._id]
                user.save(user).then(data => {
                    res.send({message: 'User was registered successfully!'})
                }).catch(err => {
                    res.status(500).send({message: err})
                })
            }).catch(err => {
                res.status(500).send({message: err})
            })
        }
    }).catch(err => {
        res.status(500).send({message: err})
    })
}

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    }).populate('roles', '-__v').then(user => {
        if(!user)
            return res.status(404).send({message: 'User not found.'})
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if(!passwordIsValid)
            return res.status(401).send({message: 'Invalid password!'})

        const token = jwt.sign({id : user.id},
            config.secret,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400
            })

        const authorities = [];

        for(let i = 0;i<user.roles.length; i++){
            authorities.push('ROLE_' + user.roles[i].name.toUpperCase())
        }

        res.status(200).send({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                lastname: user.lastname,
                birthdate: user.birthdate,
                gender: user.gender,
                email: user.email,
                city: user.city,
                roles: user.roles
            }
        })
    }).catch(err => {
        res.status(500).send({message: err})
    })
}

exports.signout = async (req, res) => {
    return res.status(200).send({message: 'You have been signed out!'})
}

exports.isadmin = async (req, res) => {
    User.findById(req.userId).then(user => {
    Role.find({
        _id: {$in: user.roles}
    }).then(roles => {
        for(let i = 0;i < roles.length; i++){
            if(roles[i].name === 'admin'){
                res.send({admin: true})
                return
            }
        }

        res.send({admin: false})
    }).catch(err => {
        res.status(500).send({message: err})
    })
}).catch(err => {
    res.status(500).send({message: err})
})
}