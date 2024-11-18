const mongoose = require('mongoose');
const { MONGODB_URI } = require('./dotenv');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI); // No additional options needed with Node.js Driver 4.0+
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;