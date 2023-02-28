const express = require('express');
const router = express.Router({mergeParams: true}); //need to specify this to be able to access the id parameter (something to do with express router...)
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
  
  router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new review');
    res.redirect(`/campgrounds/${campground._id}`);
  }))
  
  router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${req.params.id}`);
  }))

  module.exports = router;