const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 // Restricts ratings to between 1 and 5 
  },
  comment: { type: String },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;