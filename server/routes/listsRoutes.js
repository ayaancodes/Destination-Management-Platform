const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');


const listsRouter = express.Router();
listsRouter.use(authenticateToken); // Apply middleware to all routes


// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: Create a new list
listsRouter.post('/lists',
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

// Route: Update a list with destination IDs
listsRouter.put('/lists/:listName',
  param('listName').isString().withMessage('List name must be a string.'),
  body('destinationIds').isArray({ min: 1 }).withMessage('An array of destination IDs is required.')
    .custom(value => value.every(id => Number.isInteger(id) && id > 0))
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

// Route: Delete a list
listsRouter.delete('/lists/:listName',
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

// Route: Get details for a list by name
listsRouter.get('/lists/:listName',
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

module.exports = listsRouter;