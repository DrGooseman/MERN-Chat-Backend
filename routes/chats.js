const auth = require("../middleware/auth");
const { Chat } = require("../models/chat");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

const HttpError = require("../models/http-error");

router.get("/", auth, async (req, res, next) => {
  const userChats = await Chat.find({
    users: {
      $elemMatch: {
        username: req.user.username
      }
    }
  });

  res.send({ chats: userChats });
});

router.post("/", auth, async (req, res, next) => {
  const usersInChat = req.body.users; //req.body.users.map(user => ({ username: user.username }));
  //const usersInChat = [{ username: "Jim" }, { username: "bob" }];

  // const foundChat = await Chat.findOne({
  //   users: {
  //     $all: [
  //       { $elemMatch: { username: "Jim" } },
  //       { $elemMatch: { username: "bob" } }
  //     ],
  //     $size: usersInChat.length
  //   }
  // });

  let match_rules = [];
  usersInChat.forEach(element => {
    match_rules.push({
      $elemMatch: {
        username: element.username
      }
    });
  });

  let chat = await Chat.findOne({
    users: { $all: match_rules, $size: usersInChat.length }
  });

  if (chat) {
    chat.messages.push(req.body.message);
  } else {
    chat = new Chat({
      users: req.body.users,
      messages: [req.body.message]
    });
  }

  try {
    chat.save();
  } catch (err) {
    return next(new HttpError("Could not create chat, server error.", 500));
  }

  usersInChat.forEach(user =>
    res.io.to(res.socketList[user.username]).emit("updateChat", chat)
  );

  res.send({ chat: chat });
});

router.patch("/", auth, async (req, res, next) => {
  const chat = await Chat.findById(req.body.chatId);

  if (!chat) return next(new HttpError("No chat found with this id.", 404));

  chat.messages.push(req.body.message);

  try {
    chat.save();
  } catch (err) {
    return next(new HttpError("Could not add message, server error.", 500));
  }

  chat.users.forEach(user => {
    if (res.socketList[user.username])
      res.io.to(res.socketList[user.username]).emit("updateChat", chat);
  });

  res.send({ chat: chat });
});

router.patch("/users", auth, async (req, res, next) => {
  const chat = await Chat.findById(req.body.chatId);
  const newUsers = req.body.users;

  if (!chat) return next(new HttpError("No chat found with this id.", 404));

  const usersInChat = [...chat.users];

  let usersAddedMessage = "";
  for (let i = 0; i < newUsers.length; i++) {
    if (!newUsers[i].username || !newUsers[i].picture)
      return next(new HttpError("Invalid inputs.", 422));
    if (usersInChat.some(user => user.username === newUsers[i].username)) {
      continue;
    }

    usersInChat.push({
      username: newUsers[i].username,
      picture: newUsers[i].picture
    });
    if (usersAddedMessage.length > 0) usersAddedMessage += ", ";
    usersAddedMessage += newUsers[i].username + "";
  }

  //check if this new chat already exists

  let match_rules = [];
  usersInChat.forEach(element => {
    match_rules.push({
      $elemMatch: {
        username: element.username
      }
    });
  });

  let existingChat = await Chat.findOne({
    users: { $all: match_rules, $size: usersInChat.length }
  });

  if (existingChat)
    return next(new HttpError("New chat with users already exists.", 403));

  // chat.users.push(newUser);
  chat.users = usersInChat;

  chat.messages.push({
    message: usersAddedMessage + " added.",
    date: new Date()
  });

  try {
    chat.save();
  } catch (err) {
    return next(new HttpError("Could not add user, server error.", 500));
  }

  chat.users.forEach(user => {
    if (res.socketList[user.username])
      res.io.to(res.socketList[user.username]).emit("updateChat", chat);
  });

  res.send({ chat: chat });
});

module.exports = router;
