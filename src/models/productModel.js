//this code is not completetly mine, I got it from youtube: https://www.youtube.com/watch?v=9OfL9H6AmhQ and modified it a bit to fit my project
const mongoose = require('mongoose');

const TAGS_ENUM = {
  ELECTRONICS: ['phone', 'laptop', 'desktop', 'accessories'],
  CLOTHES: ['shirts', 'shorts', 'pants', 'skirts'],
  BOOKS: ['fiction', 'non-fiction', 'science-fiction', 'self-help'],
  getAllTags: function () {
    return [
      ...this.ELECTRONICS,
      ...this.CLOTHES,
      ...this.BOOKS,
    ];
  },
};

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name should be at least 3 characters long'],
      maxlength: [100, 'Product name should not exceed 100 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
      min: [0, 'Product quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price cannot be negative'],
    },
    image: {
      type: String,
      required: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [
        {
          type: String,
          enum: {
            values: TAGS_ENUM.getAllTags(),
            message: 'Invalid tag',
          },
        },
      ],
      default: [],
    },
    linkedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
  },
  {
    timestamps: true,
  }
);


// indexing for faster search
productSchema.index({ name: 1, tags: 1 });


// Static method to search by specific tag case insensitive
productSchema.statics.findByTag = function (tag) {
  return this.find({ tags: { $in: [tag] } });
};


const Product = mongoose.model('Product', productSchema);
module.exports = { Product, TAGS_ENUM };