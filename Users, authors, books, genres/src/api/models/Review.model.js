const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ReviewSchema = new Schema(
    {
        rating: {
            enum: [ 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
            required: true,
            type: Number,
        },
        review: {
            type: String
        },
        books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        postedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true
    }
)

const Review = mongoose.model('Review', ReviewSchema)

module.exports = Review