const db = require('../models')
const Message = db.messages
const User = db.users

exports.create = async (req, res) => {
    const {title, content, receiverUsername, senderId, date} = req.body;
    if(!(title && content && receiverUsername && senderId && date)){
        res.status(400).send({ message: "Wrong format for insertion"})
        return
    }

    const receiver = await User.findOne({username: receiverUsername})
    if(!receiver){
        res.status(404).send({message: 'User not found'})
        return
    }

    const message = new Message({
        title,
        content,
        date,
        sender: senderId,
        receiver: receiver.id
    })

    message.save(message).then(data => {
        res.send(data)
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred during insertion"
        })
    })
}

exports.findOne = (req,res) => {
    const id = req.params.id
    Message.findById(id).populate('receiver').populate('sender').then(data => {
        if(!data)
            res.status(404).send({message: "Not found message with id " + id})
        else res.send(data)
    }).catch(err => {
        res.status(500).send({message: "Error retrieving message with id " + id})
    })
}

exports.delete = (req,res) => {
    const id = req.params.id
    Message.findByIdAndDelete(id).then(data => {
        if(!data)
            res.status(404).send({message: "Not found message with id " + id})
        else res.send(data)
    }).catch(err => {
        res.status(500).send({message: "Error deleting message with id " + id})
    })
}