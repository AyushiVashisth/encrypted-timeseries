const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const mongoose = require("mongoose");
const EmitterModel = require("./models/emitter.model");
const connection = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const timesSeriesModel = require("./models/timesSeries.model");

const data = JSON.parse(fs.readFileSync("data.json"));

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

// // Emitter service
function generateRandomString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
}

function generateSecretKey(name, origin, destination) {
  const data = `${name}${origin}${destination}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function encryptMessage(message, passkey) {
  const cipher = crypto.createCipher("aes-256-ctr", passkey);
  let encryptedMessage = cipher.update(message, "utf8", "hex");
  encryptedMessage += cipher.final("hex");
  decryptMessage(encryptedMessage, passkey);
  // console.log("encrypted message", encryptedMessage);
  return encryptedMessage;
}

function decryptMessage(encryptedMessage, passkey) {
  const decipher = crypto.createDecipher("aes-256-ctr", passkey);
  let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf8");
  decryptedMessage += decipher.final("utf8");
  // console.log("decryptedMessage", decryptedMessage);
  //   return decryptedMessage;
}

function generateAndEmitDataStream(socket) {
  const dataStream = [];
  //   const dataCount = Math.floor(Math.random() * 451) + 49;
  const dataCount = 11;

  for (let i = 0; i < dataCount; i++) {
    const name = data.names[Math.floor(Math.random() * data.names.length)];
    const origin = data.cities[Math.floor(Math.random() * data.cities.length)];
    const destination =
      data.cities[Math.floor(Math.random() * data.cities.length)];

    const secretKey = generateSecretKey(name, origin, destination);
    const originalMessage = { name, origin, destination };
    const encryptedMessage = encryptMessage(
      JSON.stringify(originalMessage),
      secretKey
    );

    dataStream.push({
      name,
      origin,
      destination,
      secret_key: secretKey,
      encryptedMessage
    });
  }

  // Save data to MongoDB with timestamp
  const timestamp = new Date();
  const newData = new timesSeriesModel({
    timestamp,
    data: dataStream
  });
  newData.save();

  const dataStreamString = dataStream
    .map((item) => item.encryptedMessage)
    .join("|");
  socket.emit("dataStream", dataStreamString);
}

io.on("connection", (socket) => {
  // socket.emit("msg", "connected");
  // console.log("Client connected");
  setInterval(() => {
    generateAndEmitDataStream(socket);
  }, 10000); // Emit data stream every 10 seconds
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to Darabase");
  } catch (e) {
    console.log("Error connecting to database");
    resizeBy.status(404).send(e.message);
  }
  console.log(`Server is running on port ${PORT}`);
});
