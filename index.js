// Import required modules and libraries
const express = require("express"); // Express.js for creating the web server
const http = require("http"); // HTTP module for creating an HTTP server
const { Server } = require("socket.io"); // Socket.io for WebSocket communication
const crypto = require("crypto"); // Node.js crypto module for encryption and hashing
const connection = require("./config/db"); // Database connection module
const cors = require("cors"); // CORS middleware for handling cross-origin requests
require("dotenv").config(); // Load environment variables
const fs = require("fs"); // File system module for file operations
const TimeSeriesModel = require("./models/timesSeries.model"); // Database model for Time Series data
const data = JSON.parse(fs.readFileSync("data.json")); // Read data from a JSON file

// Create an Express application
const app = express();

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a Socket.io server attached to the HTTP server
const io = new Server(server);

// Enable CORS for the Express app
app.use(cors());

// Function to generate a secret key based on name, origin, and destination
function generateSecretKey(name, origin, destination) {
  const data = `${name}${origin}${destination}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Function to encrypt a message using AES-256 encryption
function encryptMessage(message, passkey) {
  const cipher = crypto.createCipher("aes-256-ctr", passkey);
  let encryptedMessage = cipher.update(message, "utf8", "hex");
  encryptedMessage += cipher.final("hex");
  // Note: decryptMessage is called here, but its return value is not used or stored
  decryptMessage(encryptedMessage, passkey);
  return encryptedMessage;
}

// Function to decrypt a message using AES-256 decryption
function decryptMessage(encryptedMessage, passkey) {
  const decipher = crypto.createDecipher("aes-256-ctr", passkey);
  let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf8");
  decryptedMessage += decipher.final("utf8");
  return decryptedMessage;
}

// Function to generate and emit a data stream to connected clients via WebSocket
function generateAndEmitDataStream(socket) {
  const name = data.names[Math.floor(Math.random() * data.names.length)];
  const origin = data.cities[Math.floor(Math.random() * data.cities.length)];
  const destination =
    data.cities[Math.floor(Math.random() * data.cities.length)];

  const secretKey = generateSecretKey(name, origin, destination);
  const originalMessage = {
    name,
    origin,
    destination,
    secretKey,
    timeStamp: Date.now(),
    meta: 5
  };
  const encryptedMessage = encryptMessage(
    JSON.stringify(originalMessage),
    secretKey
  );
  socket.emit("encrypted", { encryptedMessage, secretKey });
}

// Function to validate received data
function isDataValid(userValue, key) {
  const currentTime = Date.now();
  if (
    Object.keys(userValue).length === userValue.meta + 1 &&
    userValue.secretKey === key
  ) {
    const timeDifference = currentTime - userValue.timeStamp;
    if (timeDifference <= 60000) {
      return true;
    }
  }
  return false;
}

// Event listener for WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected");

  // Periodically generate and emit data streams to connected clients
  setInterval(() => {
    generateAndEmitDataStream(socket);
  }, 10000);

  // Event listener for "listen_request" messages from clients
  socket.on("listen_request", (receivedData) => {
    console.log("Received data:", receivedData);
    const decryptedData = JSON.parse(
      decryptMessage(receivedData.encryptedMessage, receivedData.secretKey)
    );

    // Validate the received data and save it to the database
    if (isDataValid(decryptedData, receivedData.secretKey)) {
      const { name, origin, destination, secretKey, timeStamp } = decryptedData;
      const timeSeries = new TimeSeriesModel({
        name,
        origin,
        destination,
        secretKey,
        timeStamp
      });
      timeSeries.save();

      // Emit the decoded data back to the client
      socket.emit("decoded", {
        name,
        origin,
        destination,
        secretKey,
        timeStamp
      });
    }
  });
});

// Define the port number for the server, using an environment variable or defaulting to 5000
const PORT = process.env.PORT || 5000;

// Start the server and establish a database connection
server.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to Database");
  } catch (e) {
    console.log("Error connecting to database");
    res.status(404).send(e.message);
  }
  console.log(`Server is running on port ${PORT}`);
});
