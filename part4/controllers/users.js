const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Blog = require("../models/blog");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const errorText =
    "Username and Password have to be at least 3 character long";

  try {
    if (username?.length > 2 && password?.length > 2) {
      const savedUser = await user.save();
      response.status(201).json(savedUser);
    } else {
      return response.status(400).json({ error: errorText });
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = usersRouter;
