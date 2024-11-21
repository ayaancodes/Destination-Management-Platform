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
    lastModified: {
        type: Date, 
        default: Date.now
    },
    createdAt: {
        type: Date, 
        default: Date.now
    } 
})

const List = mongoose.model('List', listSchema);
module.exports = List;