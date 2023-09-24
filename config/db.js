// Import the Mongoose library for MongoDB interaction
const mongoose = require("mongoose");

// Load environment variables from the .env file
require("dotenv").config();

// Establish a connection to the MongoDB database using the MONGO_URL environment variable
const connection = mongoose.connect(`${process.env.MONGO_URL}`, {
  useNewUrlParser: true, // Use the new URL parser
  useUnifiedTopology: true // Use the new Server Discovery and Monitoring engine
});

// Export the database connection for use in other parts of the application
module.exports = connection;
