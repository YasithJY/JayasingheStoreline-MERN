import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// POST /api/reviews - Submit a new review
router.post('/', async (req, res) => {
  const { rating, comment, photos, video, checkboxes } = req.body;

  try {
    // Validate input
    if (!rating || !comment.trim()) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    // Create a new review
    const newReview = new Review({
      rating,
      comment,
      photos,
      video,
      checkboxes
    });

    // Save the review to the database
    await newReview.save();

    res.status(201).json({ message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Failed to submit review.', error });
  }
});

export default router;
