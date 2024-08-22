const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

const { userExtractor } = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  console.log(blogs);
  response.json(blogs);
});

blogsRouter.post("/", userExtractor, async (request, response, next) => {
  const body = request.body;
  // console.log(request);
  // const bearer = request.context.bearer;

  // const decodedToken = jwt.verify(bearer, process.env.SECRET);
  // if (!decodedToken.id) {
  //   return response.status(401).json({ error: "token invalid" });
  // }

  const user = request.context.user;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user.id,
    likes: body.likes,
  });

  // try {
  if (blog.title?.length > 0 || blog.url?.length > 0) {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog.id);
    await user.save();
    response.status(201).json(savedBlog);
  } else response.status(400).json();
  // } catch (exception) {
  //   next(exception);
  // }
});

blogsRouter.delete("/:id", userExtractor, async (request, response, next) => {
  // const bearer = request.context.bearer;

  // const decodedToken = jwt.verify(bearer, process.env.SECRET);
  // if (!decodedToken.id) {
  //   return response.status(401).json({ error: "token invalid" });
  // }

  const user = request.context.user;
  const blog = await Blog.findById(request.params.id);

  if (blog.user.toString() === user.id.toString()) {
    try {
      await Blog.findByIdAndDelete(blog.id);
      response.status(204).end();
    } catch (exception) {
      next(exception);
    }
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  const blog = {
    likes: body.likes,
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    response.status(204).json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;

//OLD CODE FOR REFERENCE
// blogsRouter.get("/", (request, response) => {
//   Blog.find({}).then((blogs) => {
//     response.json(blogs);
//   });
// });

// blogsRouter.post("/", (request, response, next) => {
//   const blog = new Blog(request.body);

//   console.log(blog);

//   blog
//     .save()
//     .then((result) => {
//       response.status(201).json(result);
//     })
//     .then((savedBlog) => {
//       response.json(savedBlog);
//     })
//     .catch((error) => next(error));
// });
