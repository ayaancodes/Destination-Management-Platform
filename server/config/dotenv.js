const dotenv = require('dotenv');

//Load environment variables from .env file
dotenv.config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI,
    CSV_FILENAME: process.env.CSV_FILENAME || 'data/europe-destinations.csv',
    PORT: process.env.PORT || 3000,
};