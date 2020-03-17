const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { Chat } = require("../models/chat");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  // const userChats = Chat.find(chat =>
  //   chat.users.contains(user => user.username === req.user.username)
  // );
  const userChats = await Chat.find();

  console.log(userChats);

  res.send({ chats: userChats });
  //res
  // .header("x-auth_token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

router.post("/", auth, async (req, res, next) => {
  // const users = User.find(user => req.body.users.includes(user.username));

  // console.log(users);
  // let userArray = users.map(user => ({
  //   username: user.username,
  //   picture: user.picture
  // }));

  const newChat = new Chat({
    users: req.body.users,
    messages: [req.body.message]
  });

  console.log(newChat);

  try {
    newChat.save();
  } catch (err) {
    return next(new HttpError("Could not create chat, server error.", 500));
  }

  res.send({ chat: newChat });
  //res
  // .header("x-auth_token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
