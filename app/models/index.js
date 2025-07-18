const dbConfig = require('../config/db.config.js')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}
db.mongoose = mongoose
db.url = dbConfig.url
db.messages = require('./message.model.js')(mongoose)
db.users = require('./user.model.js')(mongoose)
db.roles = require('./role.model')(mongoose)
db.ROLES = ['user', 'admin']

module.exports = db