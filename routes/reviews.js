const express = require('express');
const router = express.Router({mergeParams: true}); //need to specify this to be able to access the id parameter (something to do with express router...)

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');

const Review = require('../models/review');
const {reviewSchema} = require('../schemas.js');

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    else{
      next();
    }
  }
  
  router.post('/', validateReview, catchAsync(async(req,res) => {
     const campground = await Campground.findById(req.params.id);
     const review = new Review(req.body.review);
     campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new review');
    res.redirect(`/campgrounds/${campground._id}`);
  }))
  
  router.delete('/:reviewId', catchAsync(async(req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${req.params.id}`);
  }))

  module.exports = router;