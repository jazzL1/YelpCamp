const mongoose = require("mongoose");
const Review = require('./review');
const Schema = mongoose.Schema; //making a reference as will be using this alot

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
  if(doc){
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

//this tells node what we want to pass from this file to other files. In this case we are creating and passing the mongoose model built from the Schema
module.exports = mongoose.model("Campground", CampgroundSchema);
