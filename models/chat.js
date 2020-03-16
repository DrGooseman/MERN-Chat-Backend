const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [{ username: String, picture: String }],
  messages: [{ message: String, date: Date, user: String }]
});

const Chat = new mongoose.model("Chat", chatSchema);

exports.Chat = Chat;
