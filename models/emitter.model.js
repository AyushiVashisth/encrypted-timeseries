const mongoose = require("mongoose");

const emitterSchema = mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  secret_key: String,
//   encryptedMessage: String
});

const EmitterModel = mongoose.model("emitter", emitterSchema);

module.exports = EmitterModel;
