const mongoose = require("mongoose");
const Campground = require("../models/campground");
const {places, descriptors} = require("./seedHelpers");
const cities = require("./cities");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const newCamp = new Campground({
            location: `${
                cities[rand1000].city
            }, ${
                cities[rand1000].state
            }`,
            title: `${
                sample(descriptors)
            } ${
                sample(places)
            }`,
            image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus laborum, enim minima nihil eum fugiat atque deserunt non sapiente sunt architecto sit, quaerat labore consequatur voluptatibus ipsam voluptatem quidem eligendi!",
            price
        });
        await newCamp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
