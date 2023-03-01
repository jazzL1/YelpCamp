const express = require('express');
const router = express.Router({mergeParams: true}); //need to specify this to be able to access the id parameter (something to do with express router...)
const reviews = require('../controllers/reviews');
const catchAsync = require('../utilities/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
  
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
  
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;