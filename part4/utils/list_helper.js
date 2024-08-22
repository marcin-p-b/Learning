const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce(
    (accumulator, currentValue) => accumulator + currentValue.likes,
    0
  );
};

const favoriteBlog = (blogs) => {
  let max = blogs.reduce(function (prev, current) {
    return prev && prev.likes > current.likes ? prev : current;
  });
  delete max["__v"];
  delete max["_id"];
  delete max["url"];

  return max;
};

const mostBlogs = (blogs) => {
  let allAuthors = blogs.map((blog) => blog.author);

  let mostAuthor = Array.from(new Set(allAuthors)).reduce((prev, curr) => {
    const blogCount = (e) => allAuthors.filter((auth) => auth === e).length;
    blogCount(curr) > blogCount(prev) ? curr : prev;
    return {
      author: curr,
      blogs: blogCount(curr),
    };
  });
  return mostAuthor;
};

const mostLikes = (blogs) => {
  let sum = 0;
  let authLikes = [];
  console.log(blogs.length);
  for (let i = 0; i < blogs.length - 1; i++) {
    if (blogs[i].author === blogs[i + 1].author) {
      console.log(blogs[i].author);
      sum += blogs[i].likes + blogs[i + 1].likes;
      console.log(sum);
      if (blogs[i + 1].likes !== 0)
        authLikes.push({
          author: blogs[i].author,
          likes: sum,
        });
      else continue;
    } else {
      sum = 0;
      if (authLikes.length === 0)
        authLikes.push({
          author: blogs[i].author,
          likes: blogs[i].likes,
        });
    }
  }

  console.log(authLikes);

  let max = authLikes.reduce(function (prev, current) {
    return prev && prev.likes > current.likes ? prev : current;
  });

  console.log(max);
  return max;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
