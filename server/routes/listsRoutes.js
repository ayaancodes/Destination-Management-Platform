const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const List = require('../models/List'); // MongoDB List model

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
listsRouter.post(
  '/',
  [
    body('name').isString().withMessage('List name must be a string.'),
    body('description').optional().isString(),
    body('destinationIds').optional().isArray(),
    body('visibility').optional().isIn(['public', 'private']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, description, destinationIds, visibility } = req.body;

      // Extract userId from authenticated token
      const userId = req.user.userId;

      // Create the list
      const newList = new List({
        userId, // Attach userId from token
        name,
        description,
        destinationIds,
        visibility,
      });

      await newList.save();

      res.status(201).json({ message: 'List created successfully.', list: newList });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

// Route: Retrieve all lists for the authenticated user
listsRouter.get('/', async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the authenticated token
    const lists = await List.find({ userId });

    if (!lists || lists.length === 0) {
      return res.status(404).json({ message: 'No lists found for this user.' });
    }

    res.json(lists);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route: Update a list by ID
listsRouter.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid list ID.'),
    body('name').optional().isString().withMessage('List name must be a string.'),
    body('description').optional().isString(),
    body('destinationIds').optional().isArray(),
    body('visibility').optional().isIn(['public', 'private']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedList = await List.findOneAndUpdate({ _id: id, userId: req.user.userId }, updates, {
        new: true, // Return the updated document
      });

      if (!updatedList) {
        return res.status(404).json({ message: 'List not found or you do not have permission to update it.' });
      }

      res.json({ message: 'List updated successfully.', list: updatedList });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

// Route: Delete a list by ID
listsRouter.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid list ID.'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedList = await List.findOneAndDelete({ _id: id, userId: req.user.userId });

      if (!deletedList) {
        return res.status(404).json({ message: 'List not found or you do not have permission to delete it.' });
      }

      res.json({ message: 'List deleted successfully.' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

// Route: Get details for a list by ID
listsRouter.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid list ID.'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const list = await List.findOne({ _id: id, userId: req.user.userId });

      if (!list) {
        return res.status(404).json({ message: 'List not found.' });
      }

      res.json(list);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

module.exports = listsRouter;
