const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    destinationIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
    }],
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 }
    }],
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            comment: { type: String, required: true },
            hidden: { type: Boolean, default: false }, // Added field for hiding reviews
            createdAt: { type: Date, default: Date.now },
        }
    ],
    lastModified: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const List = mongoose.model('List', listSchema);
module.exports = List;
