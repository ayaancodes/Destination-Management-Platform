const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = 3000;
let destinations = [];
const destinationLists = {};

// Set a configurable CSV filename
// Step 11: Allow flexibility in naming for the data file
const CSV_FILENAME = process.env.CSV_FILENAME || 'data/europe-destinations.csv';

// Load CSV data
function loadDestinations() {
    let id = 1;
    fs.createReadStream(path.join(__dirname, CSV_FILENAME))
        .pipe(csv())
        .on('data', (row) => {
            row.id = id++;
            destinations.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
}

// Middleware to parse JSON bodies, limit JSON size to prevent large payloads
app.use(express.json({ limit: '10kb' }));

// Rate limiter to allow max 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(limiter);

// Load data at startup
loadDestinations();

app.use(express.static(path.join(__dirname, '../client')));


const destinationsRouter = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ROUTES

// Get all unique countries
destinationsRouter.get('/countries', (req, res) => {
    const allCountries = destinations.map(destination => destination.Country);
    const uniqueCountriesSet = new Set(allCountries);
    const uniqueCountriesArray = Array.from(uniqueCountriesSet);
    res.json(uniqueCountriesArray);
});

// Route to get all list names
destinationsRouter.get('/lists', (req, res) => {
    const allListNames = Object.keys(destinationLists); // Get all list names as an array
    res.json(allListNames); // Respond with lists names as an array
});


// Route to create a new list with a given name
destinationsRouter.post('/lists',
    body('listName').isString().isLength({ max: 50 }).withMessage('List name must be a string under 50 characters.'),
    handleValidationErrors,
    (req, res) => {
        const { listName } = req.body;
        if (destinationLists[listName]) {
            return res.status(400).json({ error: "List name already exists." });
        }
        destinationLists[listName] = [];
        res.json({ message: `List '${listName}' created successfully.` });
    }
);

// Route to save a list of destination IDs to an existing list name
destinationsRouter.put('/lists/:listName',
    param('listName').isString().withMessage('List name must be a string.'),
    body('destinationIds').isArray({ min: 1 }).withMessage('An array of destination IDs is required.')
        .custom((value) => value.every(id => Number.isInteger(id) && id > 0))
        .withMessage('Destination IDs must be positive integers.'),
    handleValidationErrors,
    (req, res) => {
        const { listName } = req.params;
        const { destinationIds } = req.body;

        if (!destinationLists[listName]) {
            return res.status(400).json({ error: `List '${listName}' does not exist.` });
        }
        destinationLists[listName] = destinationIds;
        res.json({ message: `List '${listName}' updated successfully.` });
    }
);

// Route to get the list of destination IDs for a given list name
destinationsRouter.get('/lists/:listName',
    param('listName').isString().withMessage('List name must be a string.'),
    handleValidationErrors,
    (req, res) => {
        const { listName } = req.params;
        if (!destinationLists[listName]) {
            return res.status(404).json({ error: `List '${listName}' does not exist.` });
        }
        res.json({ destinationIds: destinationLists[listName] });
    }
);

// Route to delete a list with a given name
destinationsRouter.delete('/lists/:listName',
    param('listName').isString().withMessage('List name must be a string.'),
    handleValidationErrors,
    (req, res) => {
        const { listName } = req.params;
        if (!destinationLists[listName]) {
            return res.status(404).json({ error: `List '${listName}' does not exist.` });
        }
        delete destinationLists[listName];
        res.json({ message: `List '${listName}' has been deleted successfully.` });
    }
);

// Route to get detailed information for all destinations in a given list
destinationsRouter.get('/lists/:listName/details',
    param('listName').isString().withMessage('List name must be a string.'),
    handleValidationErrors,
    (req, res) => {
        const { listName } = req.params;

        if (!destinationLists[listName]) {
            return res.status(404).json({ error: `List '${listName}' does not exist.` });
        }

        const destinationIds = destinationLists[listName];
        const listDetails = destinationIds.slice(0, 50).map(id => {
            const destination = destinations.find(d => d.id === id);
            if (destination) {
                return {
                    name: destination.Name,
                    region: destination.Region,
                    country: destination.Country,
                    coordinates: {
                        latitude: destination.Latitude,
                        longitude: destination.Longitude
                    },
                    currency: destination.Currency,
                    language: destination.Language
                };
            }
        }).filter(Boolean);

        res.json(listDetails);
    }
);

// Search route with a limit on results
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
        const result = matches.slice(0, limit); // Return full destination objects
        res.json(result.length > 0 ? result : { error: "No matching destinations found." });
    }
);

// Get all destinations
destinationsRouter.get('/', (req, res) => {
    res.json(destinations);
});

// Get a destination by ID
destinationsRouter.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
    handleValidationErrors,
    (req, res) => {
        const id = parseInt(req.params.id, 10);
        const destination = destinations.find(d => d.id === id);
        if (destination) {
            res.json(destination);
        } else {
            res.status(404).json({ error: "Destination not found" });
        }
    }
);

// Get the geographical coordinates given a destination ID
destinationsRouter.get('/coordinates/:id',
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
    handleValidationErrors,
    (req, res) => {
        const id = parseInt(req.params.id, 10);
        const destination = destinations.find(d => d.id === id);

        if (destination) {
            res.json({
                latitude: destination.Latitude,
                longitude: destination.Longitude
            });
        } else {
            res.status(404).json({ error: "Destination not found" });
        }
    }
);

app.use('/', destinationsRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

