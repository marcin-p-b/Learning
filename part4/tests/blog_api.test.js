const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const assert = require("node:assert");
const Blog = require("../models/blog");
const helper = require("./test_helper");
const app = require("../app");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  for (let post of helper.initialBlogPosts) {
    let blogObject = new Blog(post);
    await blogObject.save();
  }
});

describe("Blog List Tests, step 1", () => {
  test("Blog posts are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are two posts", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogPosts.length);
  });
});

describe("Blog List Tests, step 2", () => {
  test("unique identifier property of the blog posts is named id", async () => {
    const response = await api.get("/api/blogs");

    const uniqueId = response.body.map((i) => Object.keys(i).slice(-1));
    uniqueId.forEach((i) => assert.strictEqual(...i, "id"));
  });
});

describe("Blog List Tests, step 3", () => {
  test("a valid post can be added ", async () => {
    const token = await api
      .post("/api/login")
      .send({ username: "hellas", password: "secret" })
      .expect(200);

    const newBlogPost = {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set("Authorization", `Bearer ${token._body.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogPosts.length + 1);

    const titles = blogsAtEnd.map((n) => n.title);
    assert(titles.includes("Go To Statement Considered Harmful"));
  });
});

describe("Blog List Expansion, step 11", () => {
  test("adding blog fails with proper status '401 Unauthorized' ", async () => {
    const token = await api
      .post("/api/login")
      .send({ username: "hellas", password: "secret" })
      .expect(200);

    const newBlogPost = {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set({ Authorization: `Bearer ${token._body.token.slice(0, -2)}` })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogPosts.length);
  });
});

describe("Blog List Tests, step 4", () => {
  test("missing like property defaults to 0 ", async () => {
    const token = await api
      .post("/api/login")
      .send({ username: "hellas", password: "secret" })
      .expect(200);

    const newBlogPost = {
      title: "missing like property defaults to 0",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set({ Authorization: `Bearer ${token._body.token}` })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    const likes = blogsAtEnd.at(-1)["likes"];

    assert.strictEqual(likes, 0);
  });
});

describe("Blog List Tests, step 4", () => {
  test("post without title or url is not added", async () => {
    const token = await api
      .post("/api/login")
      .send({ username: "hellas", password: "secret" })
      .expect(200);

    const newBlogPost = { author: "Edsger W. Dijkstra" };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set({ Authorization: `Bearer ${token._body.token}` })
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogPosts.length);
  });
});

describe("Blog List Expansions, step 1", () => {
  test("blog post can be deleted", async () => {
    const token = await api
      .post("/api/login")
      .send({ username: "hellas", password: "secret" })
      .expect(200);

    const user = await helper.usersInDb();

    const newBlogPost = {
      title: "This blog is going to be deleted",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      user: user[0].id,
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set("Authorization", `Bearer ${token._body.token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogPostAtStart = await helper.blogsInDb();
    const blogPostToDelete =
      blogPostAtStart[
        blogPostAtStart.findIndex(
          (p) => p.title == "This blog is going to be deleted"
        )
      ];

    await api
      .delete(`/api/blogs/${blogPostToDelete.id}`)
      .set({ Authorization: `Bearer ${token._body.token}` })
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, blogPostAtStart.length - 1);

    const ids = blogsAtEnd.map((r) => r.id);
    assert(!ids.includes(blogPostToDelete.id));
  });
});

describe("Blog List Expansions, step 2", () => {
  test("blog post's like count can be updated", async () => {
    const blogPostAtStart = await helper.blogsInDb();
    const blogPostToUpdate = blogPostAtStart[0];

    blogPostToUpdate.likes -= 1;

    await api.put(`/api/blogs/${blogPostToUpdate.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    console.log("start", blogPostAtStart);
    console.log("end", blogsAtEnd);

    assert.strictEqual(blogPostAtStart[0].likes, blogsAtEnd[0].likes - 1);
  });
});

after(async () => {
  await mongoose.disconnect();
});
