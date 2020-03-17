const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { Chat } = require("../models/chat");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  const userChats = await Chat.find({
    users: {
      $elemMatch: {
        username: req.user.username
      }
    }
  });

  console.log(userChats);

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

  res.send({ chat: chat });
});

module.exports = router;
