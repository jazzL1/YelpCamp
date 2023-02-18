const mongoose = require("mongoose");
const Schema = mongoose.Schema; //making a reference as will be using this alot

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
});

//this tells node what we want to pass from this file to other files. In this case we are creating and passing the mongoose model built from the Schema
module.exports = mongoose.model("Campground", CampgroundSchema);
