const express = require('express')
const path = require('path') // we have access to path through node and need this line to set an absolute path for some of our folders like views
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const { assert } = require('console')
const review = require('./models/review')
const campground = require('./models/campground')

mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected')
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs') // need to set the view engine to ejs
app.set('views', path.join(__dirname, 'views'))
// setting the absolute path for the views folder so the program will run even if you are not running it from the dir that views is in

// tell express to parse the body of a req
app.use(express.urlencoded({ extended: true }))
// to override method of form submission
app.use(methodOverride('_method'))

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

app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground) // everything is under "campground due to how we named elements in the form"
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  }))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, {
    ...req.body.campground
  })
  res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id)
  res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res) => {
   const campground = await Campground.findById(req.params.id);
   const review = new Review(req.body.review);
   campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res) => {
  await Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}});
  await Review.findByIdAndDelete(req.params.reviewId);
  res.redirect(`/campgrounds/${req.params.id}`);
}))

app.all('/*', (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if(!err.message) {
    err.message = 'Oh No, Something went wrong'};
  res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
  console.log('SERVING ON PORT 3000')
})
