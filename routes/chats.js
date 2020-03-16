const auth = require("../middleware/auth");
const { User } = require("../models/user");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  //return next(new HttpError("Username already in use.", 400));
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send({ message: "Email already in use." });

  user = new User(_.pick(req.body, ["name", "email", "password", "lang"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user.allLangs["words" + req.body.lang] = getPopulatedWordsNewUser(
    req.body.lang
  );

  await user.save();

  const token = user.generateAuthToken();
  res.json({
    _id: user._id,
    email: user.email,
    name: user.name,
    token,
    lang: user.lang
  });
  //res
  // .header("x-auth_token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
