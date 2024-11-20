const express = require('express');
const { param, validationResult, query } = require('express-validator');

const destinationsRouter = express.Router();


// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: Get all unique countries
destinationsRouter.get('/countries', (req, res) => {
  const allCountries = destinations.map(destination => destination.Country);
  const uniqueCountriesSet = new Set(allCountries);
  const uniqueCountriesArray = Array.from(uniqueCountriesSet);
  res.json(uniqueCountriesArray);
});

// Route: Get geographical coordinates for a destination by ID
destinationsRouter.get('/coordinates/:id',
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
  handleValidationErrors,
  (req, res) => {
    const id = parseInt(req.params.id, 10);
    const destination = destinations.find(d => d.id === id);

    if (destination) {
      res.json({
        latitude: destination.Latitude,
        longitude: destination.Longitude,
      });
    } else {
      res.status(404).json({ error: 'Destination not found' });
    }
  }
);

// Route: Search destinations by field and pattern
destinationsRouter.get('/search',
  query('field').isString().withMessage('Field must be a string.'),
  query('pattern').isString().withMessage('Pattern must be a string.'),
  query('n').optional().isInt({ min: 1, max: 50 }).withMessage('n must be an integer between 1 and 50.'),
  handleValidationErrors,
  (req, res) => {
    const { field, pattern, n } = req.query;

    if (!destinations[0] || !(field in destinations[0])) {
      return res.status(400).json({ error: `Field '${field}' does not exist in destination data.` });
    }

    const matches = destinations.filter(destination =>
      destination[field] && destination[field].toLowerCase().includes(pattern.toLowerCase())
    );

    const limit = Math.min(parseInt(n, 10) || matches.length, 50);
    res.json(matches.slice(0, limit));
  }
);

module.exports = destinationsRouter;