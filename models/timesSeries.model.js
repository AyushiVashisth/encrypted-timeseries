const mongoose = require('mongoose');

const timeSeriesSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  data: [
    {
      name: String,
      origin: String,
      destination: String,
      secret_key: String,
      encryptedMessage: String,
    },
  ],
});

module.exports = mongoose.model('TimeSeries', timeSeriesSchema);
