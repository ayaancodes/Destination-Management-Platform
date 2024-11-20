const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['regular', 'admin'],
    default: 'regular',
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active', // Fixed default value
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema); // Fixed schema reference
module.exports = User;