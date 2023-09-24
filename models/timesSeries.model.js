// Import the Mongoose library for working with MongoDB
const mongoose = require("mongoose");

// Define a schema for the "TimeSeries" data
const timeSeriesSchema = new mongoose.Schema({
  name: String, // Store a name as a string
  origin: String, // Store an origin as a string
  destination: String, // Store a destination as a string
  secret_key: String, // Store a secret key as a string
  timeStamp: { type: Date, default: Date.now } // Store a timestamp as a Date, defaulting to the current date and time
});

// Create a Mongoose model named "TimeSeries" based on the defined schema
module.exports = mongoose.model("TimeSeries", timeSeriesSchema);
