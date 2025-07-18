module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            title: String,
            content: String,
            date: Date,
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            receiver: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        },
        {
            timestamps: true
        }
    )

    schema.method('toJSON', function() {
        const {__v, _id, ...object} = this.toObject()
        object.id = _id
        return object
    })

    return mongoose.model('message', schema)
}