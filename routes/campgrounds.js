const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware.js');

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    else{
      next();
    }
  }

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})  ;
    res.render('campgrounds/index', { campgrounds });
  }))
  
  router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
  })
  
  router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
      const campground = new Campground(req.body.campground); // everything is under "campground due to how we named elements in the form"
      await campground.save();
      req.flash('success', 'Successfully added a new campground!');
      res.redirect(`/campgrounds/${campground._id}`);
    }))
  
  router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
      req.flash('error', 'Cannot find that campground :(');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  }))
  
  router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground :(');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
  }))
  
  router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
      ...req.body.campground
    });
    req.flash('success', 'Successfully modified this campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  }))
  
  router.delete('/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds');
  }))

  module.exports = router;