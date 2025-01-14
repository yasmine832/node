const mongoose = require("mongoose");
const { TAGS_ENUM } = require("../models/productModel");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title should be at least 5 characters long"],
      maxlength: [100, "Title should not exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [20, "Content should be at least 20 characters long"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, // refers to usermodel
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    tags: {
      type: [
        {
          type: String,
          enum: {
            values: TAGS_ENUM.getAllTags(),
            message: "Invalid tag",
          },
        },
      ],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    linkedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// indexing for faster tag-based search
postSchema.index({ tags: 1 });

// Static method to search by tag
postSchema.statics.findByTag = function (tag) {
  return this.find({ tags: tag });
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;