//const error = require("../middleware/error");

const users = require("./routes/users");
const chats = require("./routes/chats");
//const auth = require("../routes/auth");
const express = require("express");

module.exports = function(app) {
  app.use(express.json());

  app.use("/api/users", users);

  app.use("/api/chats", chats);
  //  app.use('/api/auth', auth);
  // app.use(error);
};
