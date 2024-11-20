const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
//const stripBom = require('strip-bom-stream');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { MONGODB_URI } = require('../config/dotenv');

const seedDestinations = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Destination.deleteMany();
    console.log('Cleared existing destinations');

    //Stack
    const destinations = [];
    const filePath = path.join(__dirname, '../data/europe-destinations.csv');

    fs.createReadStream(filePath)
      //.pipe(stripBom()) // Remove BOM characters
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() })) // Trim headers
      .on('data', (row) => {
        console.log('Destination:', row.Destination); // Debug Destination field
        console.log('Country:', row.Country); // Debug Country field

        // Validate required fields
        if (row.Destination && row.Country) {
          //Uses a stack
          destinations.push({
            name: row.Destination.trim(),
            country: row.Country.trim(),
            region: row.Region ? row.Region.trim() : null,
            latitude: row.Latitude ? parseFloat(row.Latitude) : null,
            longitude: row.Longitude ? parseFloat(row.Longitude) : null,
            currency: row.Currency ? row.Currency.trim() : null,
            language: row.Language ? row.Language.trim() : null,
          });
        } else {
          console.log(`Skipping invalid row: ${JSON.stringify(row)}`);
        }
      })
      .on('end', async () => {
        try {
          await Destination.insertMany(destinations);
          console.log(`Seeded ${destinations.length} destinations successfully`);
        } catch (insertError) {
          console.error('Error inserting destinations:', insertError.message);
        } finally {
          mongoose.disconnect();
        }
      });
  } catch (error) {
    console.error('Error seeding destinations:', error.message);
    mongoose.disconnect();
  }
};

seedDestinations();