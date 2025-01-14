const Post = require("../models/postModel");
const User = require("../models/userModel");
const { Product, TAGS_ENUM } = require("../models/productModel");

const postController = {
  getAllPosts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        tag,
        sort,
        order,
      } = req.query;
      const skip = (page - 1) * limit;

      let query = {};

      if (search) {
        query = {
          $or: [
            { title: { $regex: new RegExp(search, "i") } },
            { content: { $regex: new RegExp(search, "i") } }
          ]
        };
      }

      if (tag) {
        const postsByTag = await Post.findByTag(tag);
        return res.status(200).json(postsByTag);
      }

      const sortOptions = {};
      if (sort && order) {
        if (sort === 'createdAt') {
          sortOptions[sort] = order.toLowerCase() === 'desc' ? -1 : 1;
        } else {
          sortOptions[sort] = order.toLowerCase() === 'desc' ? -1 : 1;
        }
      }

      
      const posts = await Post.find(query)
        .populate("author", "username")
        .populate("linkedProducts", "name")
        .skip(skip)
        .sort(sortOptions)
        .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.status(200).json({
            data: posts,
            metadata: {
              total,
              page: parseInt(page),
              limit: parseInt(limit)
            }
          });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPostById: async (req, res) => {
    try {
      const postId = req.params.postId;
      const post = await Post.findById(postId)
        .populate("author", "username")
        .populate("linkedProducts", "name");
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createPost: async (req, res) => {
    try {
      const { title, content, author, linkedProducts, tags } = req.body;

      // Create a new post
      const newPost = new Post({
        title,
        content,
        author,
        linkedProducts,
        tags,
      });

      // Save the new post
      const savedPost = await newPost.save();

      // Update user's posts array
      await User.findByIdAndUpdate(author, { $push: { posts: savedPost._id } });

      // Update linkedPosts with the new post
      if (linkedProducts && linkedProducts.length > 0) {
        for (const productId of linkedProducts) {
          // Find the product and update linkedPosts
          const product = await Product.findById(productId);
          if (product) {
            product.linkedPosts.push(savedPost._id);
            product.addedBy = author; // Set addedBy to the author (user's ID)
            await product.save();
          }
        }
      }

      res.status(201).json(savedPost);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const postId = req.params.postId;
      const { title, content, linkedProducts, tags } = req.body;
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, content, linkedProducts, tags },
        { new: true }
      );
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      await Product.updateMany(
        { linkedPosts: postId },
        { $pull: { linkedPosts: postId } }
      );
      if (linkedProducts && linkedProducts.length > 0) {
        await Product.updateMany(
          { _id: { $in: linkedProducts } },
          { $push: { linkedPosts: postId } }
        );
      }
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const postId = req.params.postId;
      const deletedPost = await Post.findByIdAndDelete(postId);
      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      await User.findByIdAndUpdate(deletedPost.author, {
        $pull: { posts: postId },
      });
      await Product.updateMany(
        { linkedPosts: postId },
        { $pull: { linkedPosts: postId } }
      );
      res
        .status(200)
        .json({ message: "Post deleted successfully", deletedPost });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getProductsByTag: async (req, res) => {
    const tag = req.params.tag;
    try {
      const products = await Product.findByTag(tag);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = postController;