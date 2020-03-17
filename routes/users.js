const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { User, validate } = require("../models/user");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const HttpError = require("../models/http-error");
const fileUpload = require("../middleware/file-upload");

router.post("/login", async (req, res, next) => {
  let user;

  try {
    user = await User.findOne({ email: req.body.email });
  } catch (err) {
    return next(new HttpError("Login failed, try again later.", 500));
  }

  if (!user) return next(new HttpError("User not found.", 404));

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(req.body.password, user.password);
  } catch (err) {
    return next(new HttpError("Login failed, try again later.", 500));
  }

  if (!isValidPassword)
    return next(new HttpError("Email or password is incorrect.", 403));

  const token = user.generateAuthToken();

  res.json({
    _id: user._id,
    email: user.email,
    username: user.username,
    token,
    picture: user.picture
  });
  // console.log(_.pick(user, ["_id", "name", "email"]));
  //  res
  //  .header("x-auth_token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

router.post("/", fileUpload.single("picture"), async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) return next(new HttpError("Invalid inputs.", 400));

  let user = await User.findOne({ email: req.body.email });

  if (user) return next(new HttpError("Email already in use.", 400));

  user = await User.findOne({ username: req.body.username });

  if (user) return next(new HttpError("Username already in use.", 400));

  user = new User(_.pick(req.body, ["username", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  if (!req.file) return next(new HttpError("No image sent.", 400));

  user.picture = req.file.key;

  await user.save();

  const token = user.generateAuthToken();
  res.json({
    _id: user._id,
    email: user.email,
    username: user.username,
    token,
    picture: user.picture
  });
  //res
  // .header("x-auth_token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

router.get("/", async (req, res, next) => {
  const foundUsers = await User.find();

  if (!foundUsers) return next(new HttpError("Users not found.", 404));

  const users = foundUsers.map(user => ({
    username: user.username,
    picture: user.picture
  }));

  res.send({ users: users });
});

module.exports = router;
