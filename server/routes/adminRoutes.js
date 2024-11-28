const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authorizeAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const List = require('../models/List'); // Ensure List is imported here

const adminRouter = express.Router();

// Middleware to validate requests
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: Grant admin privilege to a user
adminRouter.put(
  '/users/:id',
  [param('id').isMongoId().withMessage('Invalid user ID.')],
  authorizeAdmin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      user.role = 'admin';
      await user.save();

      res.json({ message: 'User granted admin privileges.', user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);


// Route: Hide or unhide a review
adminRouter.put(
  '/reviews/:id/hide',
  [
    param('id').isMongoId().withMessage('Invalid review ID.'), // This is the review ID
    body('hidden').isBoolean().withMessage('Hidden flag must be a boolean.'),
  ],
  authorizeAdmin, // Ensure only admins can access this
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params; // Review ID
      const { hidden } = req.body;

      // Find the list containing the review
      const list = await List.findOne({ 'reviews._id': id });
      if (!list) {
        return res.status(404).json({ error: 'Review not found.' });
      }

      // Find the specific review in the embedded `reviews` array
      const review = list.reviews.id(id);
      if (!review) {
        return res.status(404).json({ error: 'Review not found.' });
      }

      // Set the hidden flag for the review
      review.hidden = hidden;

      // Save the updated list
      await list.save();

      res.json({
        message: `Review ${hidden ? 'hidden' : 'unhidden'} successfully.`,
        review,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);





// Route: Disable or enable a user
adminRouter.put(
  '/users/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid user ID.'),
    body('status')
      .isIn(['active', 'disabled'])
      .withMessage('Status must be either "active" or "disabled".'),
  ],
  authorizeAdmin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      user.status = status;
      await user.save();

      res.json({ message: `User status updated to ${status}.`, user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

module.exports = adminRouter;
