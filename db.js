const mongoose = require("mongoose");

module.exports = function() {
  mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
    useUnifiedTopology: true
  });
};
