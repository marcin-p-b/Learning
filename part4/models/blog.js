const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String },
    author: { type: String },
    url: { type: String },
    likes: { type: Number, default: 0 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { id: true }
);

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // delete returnedObject.user;
  },
});

module.exports = mongoose.model("Blog", blogSchema);
