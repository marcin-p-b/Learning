const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogPosts = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    user: "66c66ab9fa7c1178a5add5fe",
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
];

const initialUsers = [
  {
    username: "hellas",
    name: "Arto Hellas",
    password: "salainen",
  },
  {
    username: "mluukkai",
    name: "Matti Luukkainen",
    password: "salainen",
  },
];

// const nonExistingId = async () => {
//   const blog = new Blog({ title: "willremovethissoon" });
//   await blog.save();
//   await blog.deleteOne();

//   return blog._id.toString();
// };

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialBlogPosts,
  initialUsers,
  // nonExistingId,
  blogsInDb,
  usersInDb,
};
