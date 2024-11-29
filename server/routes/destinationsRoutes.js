const express = require('express');
const { param, validationResult, query } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const Destination = require('../models/Destination'); // Import the Destination model

const destinationsRouter = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: Get all unique countries (No authentication required)
destinationsRouter.get('/countries', async (req, res) => {
  try {
    const destinations = await Destination.find({}, 'country'); // Query MongoDB for country field
    const uniqueCountries = [...new Set(destinations.map(d => d.country))]; // Extract unique countries
    res.json(uniqueCountries);
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route: Get geographical coordinates for a destination by ID (No authentication required)
destinationsRouter.get(
  '/coordinates/:id',
  param('id').isMongoId().withMessage('ID must be a valid MongoDB ObjectId.'),
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const destination = await Destination.findById(id); // Query MongoDB by ID
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.json({
        latitude: destination.latitude,
        longitude: destination.longitude,
      });
    } catch (error) {
      console.error('Error fetching coordinates:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// Route: Search destinations by field and pattern (No authentication required)
destinationsRouter.get(
  '/search',
  [
    query('field').isString().withMessage('Field must be a string.'),
    query('pattern').isString().withMessage('Pattern must be a string.'),
    query('n').optional().isInt({ min: 1, max: 50 }).withMessage('n must be an integer between 1 and 50.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { field, pattern, n } = req.query;

    try {
      // Validate if the field exists in the schema
      const schemaFields = Object.keys(Destination.schema.paths);
      if (!schemaFields.includes(field)) {
        return res.status(400).json({ error: `Field '${field}' does not exist in destination data.` });
      }

      // Query MongoDB with regex search
      const matches = await Destination.find({
        [field]: { $regex: new RegExp(`^${pattern}`, 'i') }, // Case-insensitive search
      }).limit(parseInt(n, 10) || 50);

      if (matches.length === 0) {
        return res.status(404).json({ error: 'No matching destinations found.' });
      }
      res.json(matches);
    } catch (error) {
      console.error('Error searching destinations:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// Route: Get all destinations (No authentication required)
destinationsRouter.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find(); // Fetch all destinations
    res.json(destinations);
  } catch (error) {
    console.error('Error fetching all destinations:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route: Get a destination by ID (No authentication required)
destinationsRouter.get(
  '/:id',
  param('id').isMongoId().withMessage('ID must be a valid MongoDB ObjectId.'),
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;

    try {
      const destination = await Destination.findById(id); // Fetch destination by ID
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.json(destination);
    } catch (error) {
      console.error('Error fetching destination by ID:', error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);


module.exports = destinationsRouter;
