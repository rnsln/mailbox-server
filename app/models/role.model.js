module.exports = mongoose => {
    const schema = mongoose.Schema({
        name: String
    })

    return mongoose.model('role', schema)
}