const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const List = require('../models/List'); // MongoDB List model

const listsRouter = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route: Get all public lists with pagination (No authentication required)
listsRouter.get('/public-lists', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const publicLists = await List.find({ visibility: 'public' })
      .populate('userId', 'nickname') // Populate the creator's nickname
      .populate('destinationIds') // Populate destinations
      .sort({ lastModified: -1 }) // Sort by last-modified date in descending order
      .skip(skip)
      .limit(limit);

    const totalPublicLists = await List.countDocuments({ visibility: 'public' });

    res.json({
      lists: publicLists,
      currentPage: page,
      totalPages: Math.ceil(totalPublicLists / limit),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route: Get all lists created by the authenticated user
// Route: Get all lists created by the authenticated user
listsRouter.get('/my-lists', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the authenticated token

    // Find all lists created by the user and populate destination details
    const userLists = await List.find({ userId })
      .sort({ lastModified: -1 })
      .populate('destinationIds', 'name country'); // Populate destination details

    if (!userLists || userLists.length === 0) {
      return res.status(404).json({ message: 'No lists found for this user.' });
    }

    res.json(userLists);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});




// Route: Search for public lists (No authentication required)
listsRouter.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  try {
    const searchCriteria = {
      visibility: 'public',
      name: { $regex: query, $options: 'i' },
    };

    const results = await List.find(searchCriteria).populate('userId', 'nickname');

    if (results.length === 0) {
      return res.status(404).json({ message: 'No public lists found matching the criteria.' });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});



// Route: Fetch all visible reviews for a specific list 
listsRouter.get(
  '/:id/reviews',
  param('id').isMongoId().withMessage('Invalid list ID.'),
  authenticateToken,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch the list and filter out hidden reviews
      const list = await List.findById(id);
      if (!list) {
        return res.status(404).json({ error: 'List not found.' });
      }

      // Filter visible reviews
      const visibleReviews = list.reviews.filter(review => !review.hidden);

      res.json({ reviews: visibleReviews });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);




// Route: Rate a public list
listsRouter.post(
  '/:id/rate',
  [
    param('id').isMongoId().withMessage('Invalid list ID.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  ],
  authenticateToken,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const userId = req.user.userId; // Extract authenticated user ID

      // Find the list
      const list = await List.findById(id);

      if (!list) {
        return res.status(404).json({ error: 'List not found.' });
      }

      if (list.visibility !== 'public') {
        return res.status(403).json({ error: 'You can only rate public lists.' });
      }

      // Check if the user has already rated
      const existingRating = list.ratings.find(r => r.userId.toString() === userId);

      if (existingRating) {
        // Update the existing rating
        existingRating.rating = rating;
      } else {
        // Add a new rating
        list.ratings.push({ userId, rating });
      }

      // Recalculate average rating
      const totalRatings = list.ratings.reduce((sum, r) => sum + r.rating, 0);
      list.averageRating = totalRatings / list.ratings.length;

      await list.save();

      res.json({ message: 'Rating submitted successfully.', list });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

// Route: Users can submit a review for a public list
listsRouter.post(
  '/:id/review',
  [
    param('id').isMongoId().withMessage('Invalid list ID.'),
    body('comment').isString().withMessage('Review comment must be a string.'),
  ],
  authenticateToken,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.userId;

      const list = await List.findById(id);
      if (!list) {
        return res.status(404).json({ error: 'List not found.' });
      }

      if (list.visibility !== 'public') {
        return res.status(403).json({ error: 'Cannot review a private list.' });
      }

      // Add the new review
      const newReview = {
        userId,
        comment,
        createdAt: Date.now(),
        hidden: false, // Ensure the review is public by default
      };
      list.reviews.push(newReview);

      await list.save();

      res.status(201).json({ message: 'Review added successfully.', review: newReview });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);






// Route: Update a review
listsRouter.put(
  '/:id/review',
  [
    param('id').isMongoId().withMessage('Invalid list ID.'),
    body('comment').isString().withMessage('Review comment must be a string.'),
  ],
  authenticateToken,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.userId;

      const list = await List.findById(id);
      if (!list) {
        return res.status(404).json({ error: 'List not found.' });
      }

      const review = list.reviews.find(r => r.userId.toString() === userId);
      if (!review) {
        return res.status(404).json({ error: 'Review not found.' });
      }

      // Update the review
      review.comment = comment;
      review.createdAt = Date.now();

      await list.save();

      res.json({ message: 'Review updated successfully.', review });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);



// Route: Delete a review
listsRouter.delete(
  '/:id/review',
  param('id').isMongoId().withMessage('Invalid list ID.'),
  authenticateToken,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const list = await List.findById(id);
      if (!list) {
        return res.status(404).json({ error: 'List not found.' });
      }

      const reviewIndex = list.reviews.findIndex(r => r.userId.toString() === userId);
      if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found.' });
      }
      // Remove the review
      list.reviews.splice(reviewIndex, 1);
      await list.save();

      res.json({ message: 'Review deleted successfully.' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);





// Route: Create a new list
listsRouter.post(
  '/',
  [
    body('name').isString().withMessage('List name must be a string.'),
    body('description').optional().isString(),
    body('destinationIds').optional().isArray(),
    body('visibility').optional().customSanitizer(value => value.toLowerCase()).isIn(['public', 'private']),
  ],
  handleValidationErrors,
  authenticateToken,
  async (req, res) => {
    try {
      const { name, description, destinationIds, visibility } = req.body;
      const userId = req.user.userId; // Extract userId from the authenticated token

      // Check if a list with the same name exists for the user
      const existingList = await List.findOne({ userId, name });
      if (existingList) {
        return res.status(400).json({ error: 'You already have a list with this name. Please choose a unique name.' });
      }

      // Create the list
      const newList = new List({
        userId,
        name,
        description,
        destinationIds,
        visibility: visibility || 'private', // Default visibility is 'private'
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
  authenticateToken,
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
  authenticateToken,
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

      const list = await List.findById(id)
        .populate('destinationIds', 'name country') // Populate destination details
        .populate('userId', 'nickname name email'); // Populate user details
        
      console.log(list);
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



listsRouter.post('/:id/add-destination', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { destinationId } = req.body;

  try {
    const list = await List.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $addToSet: { destinationIds: destinationId } }, // Prevent duplicate destination IDs
      { new: true }
    ).populate('destinationIds', 'name country');

    if (!list) {
      return res.status(404).json({ error: 'List not found or you do not have permission to modify it.' });
    }

    res.status(200).json({ message: 'Destination added successfully.', list });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});




module.exports = listsRouter;
