const { Product, TAGS_ENUM } = require('../models/productModel');

const productController = {
  getAllProducts: async (req, res) => {
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
        query = { name: { $regex: new RegExp(search, "i") } };
      }

      if (tag) {
        const productsByTag = await Product.findByTag(tag);
        return res.status(200).json(productsByTag);
      }

      const sortOptions = {};
      if (sort && order) {
        sortOptions[sort] = order.toLowerCase() === 'desc' ? -1 : 1;
      }

      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

        res.status(200).json({
            data: products,
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

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createProduct: async (req, res) => {
    const { name, quantity, price, image, tags, addedBy } = req.body;

    if (!name || !quantity || !price || !addedBy) {
      return res
        .status(400)
        .json({ message: "Name, quantity, and price are required" });
    }

    try {
      const newProduct = await Product.create({
        name,
        quantity,
        price,
        image,
        addedBy,
        tags,
      });

      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateProduct: async (req, res) => {
    const { name, quantity, price, image, tags } = req.body;

    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.productId,
        {
          ...(name && { name }),
          ...(quantity && { quantity }),
          ...(price && { price }),
          ...(image && { image }),
          ...(tags && { tags }),
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(
        req.params.productId
      );

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = productController;