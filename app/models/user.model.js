module.exports = mongoose => {
    const schema = mongoose.Schema({
        username: String,
        password: String,
        email: String,
        name: String,
        lastname: String,
        birthdate: Date,
        city: String,
        gender: String,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'role'
            }
        ]
    })

    schema.method('toJSON', function() {
        const {__v, _id, ...object} = this.toObject()
        object.id = _id
        return object
    })

    const User = mongoose.model('user', schema)
    return User
}