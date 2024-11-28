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
    default: 'active', 
  },
  isVerified: {
    type: Boolean,
    default: false, // Not verified by default
  },
  verificationToken: {
    type: String, // Token to verify email
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

const User = mongoose.model('User', userSchema); 
module.exports = User;