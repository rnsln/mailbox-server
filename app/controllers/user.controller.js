const db = require('../models')
const bcrypt = require("bcryptjs");
const {findOne} = require("./message.controller");
const {SchemaTypes, Types} = require("mongoose");
const User = db.users
const Role = db.roles
const Message = db.messages

exports.getOne = (req, res) => {
    const id = req.params.id

    User.findById(id).populate('roles', '-__v').then(data => {
        if(!data)
            res.status(404).send({message: 'Not found user with id ' + id})
        else
            res.send(data)
    }).catch(err=> {
        res.status(500).send({message: err || 'Some error occurred retrieving user'})
    })
}

exports.create = (req, res) => {
    const {username, password, email, name, lastname, birthdate, city, gender, roles} = req.body

    if(!(username && password && email)){
        res.status(400).send({message: 'Please state all the information for user to be created!'})
        return
    }

    const user = new User({
        username,
        password: bcrypt.hashSync(req.body.password, 8),
        email,
        name,
        lastname,
        birthdate,
        city,
        gender,
        roles
    })
    Role.find({name: {$in : req.body.roles.map(r => r.name)}}).then(roles => {
        user.roles = roles.map(role => role._id)
        user.save(user).then(data => {
            res.send(data)
        }).catch(err => {
            res.status(500).send({message: err || 'Some error occurred inserting new user'})
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.delete = (req,res) => {
    const id = req.params.id
    User.findByIdAndDelete(id).then(data => {
        if(!data)
            res.status(404).send({message: 'Not found user with id ' + id})
        else
            res.send({message: 'User deleted successfully.'})
    }).catch(err => {
        res.status(500).send({message: err || 'Some error occurred deleting new user'})
    })
}

exports.update = (req, res) => {
    if(!req.body) {
        res.status(400).send({message: 'Update body must not be empty'})
        return
    }
    if(req.body.password==null || req.body.password==='')
        delete req.body.password
    else
        req.body.password = bcrypt.hashSync(req.body.password, 8)

    const id = req.params.id
    Role.find({name: {$in : req.body.roles.map(r => r.name)}}).then(roles => {
        req.body.roles = roles.map(role => role._id)

        User.findByIdAndUpdate(id, req.body).then(data => {
            if(!data)
                res.status(404).send({message: 'Not found user with id ' + id})
            else
                res.send({message: 'User updated successfully'})
        }).catch(err => {
            res.status(500).send({message: err || 'Some error occurred updating the user'})
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.findAll = (req, res) => {

    User.find(req.body).then(data => {
        res.send(data)
    }).catch(err => {
        res.status(500).send({message: err || 'Some error occurred retrieving the users'})
    })
}

exports.findAllFiltered = async (req, res) => {
    const size = req.body.size;
    const offset = req.body.offset;
    const {usernameSearch, emailSearch, nameSearch, lastnameSearch, orderProp, order} = req.body;
    const filter = {
        username: {'$regex': usernameSearch, '$options': 'i'},
        email: {'$regex': emailSearch, '$options': 'i'},
        name: {'$regex': nameSearch, '$options': 'i'},
        lastname: {'$regex': lastnameSearch, '$options': 'i'}
    }
    const sort = {}
    if(orderProp != '')
        sort[orderProp] = order

    const count = await User.collection.countDocuments(filter)
    User.find(filter).sort(sort).skip(offset).limit(size).then(users => {
        res.send({count, users})
    }).catch(err => {
        res.status(500).send({message: err || 'Some error occurred retrieving the users'})
    })
}

exports.getInbox = async (req, res) => {
    const id = req.params.id
    const size = req.body.size;
    const page = req.body.page;
    const count = await Message.collection.countDocuments({receiver: new Types.ObjectId(id)})

    Message.find({receiver: id}).skip(page*size).limit(size).populate('receiver').populate('sender').then(messages => {
        messages.forEach(m => {
            m.content = m.content.substring(0,30)
        })
        let totalPages = Math.ceil(count/size)
        res.send({totalPages, count, messages})
    }).catch(err => {
        res.status(404).send({
            err: 'Could not find the user: ' + err
        })
    })
}

exports.getOutbox = async (req, res) => {
    const id = req.params.id
    const size = req.body.size;
    const page = req.body.page;
    const count = await Message.collection.countDocuments({sender: new Types.ObjectId(id)})

    Message.find({sender: id}).skip(page*size).limit(size).populate('receiver').populate('sender').then(messages => {
        messages.forEach(m => {
            m.content = m.content.substring(0,30)
        })
        let totalPages = Math.ceil(count/size)
        res.send({totalPages, count, messages})
    }).catch(err => {
        res.status(404).send({
            err: 'Could not find the user: ' + err
        })
    })
}

exports.getOneByUsername = (req, res) => {
    const username = req.params.username

    User.findOne({username: username}).then(user => {
        res.send(user)
    }).catch(error => {
        res.status(500).send({error})
    })
}

exports.patchOne = (req, res) => {
    const id = req.params.id

    User.findByIdAndUpdate(id, req.body).then(user => {
        exports.getOne(req,res)
    }).catch(error => {
        res.status(500).send({error})
    })
}

exports.search = (req, res) => {
    const term = req.params.term
    if(!term)
        res.send([])

    User.find({username: {$regex: "^" + term}}).select('username').then(users => {
        res.send(users.map(u => u.username))
    }).catch(error => {
        res.status(500).send({error})
    })
}