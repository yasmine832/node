const User = require('../models/userModel');

const UserController = {
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort,
        order
      } = req.query;
      const skip = (page - 1) * limit;

      let query = {};

      if (search) {
        query = {
          $or: [
            { username: { $regex: new RegExp(search, "i") } },
            { email: { $regex: new RegExp(search, "i") } },
            { firstName: { $regex: new RegExp(search, "i") } }
          ]
        };
      }

      const sortOptions = {};
      if (sort && order) {
        sortOptions[sort] = order.toLowerCase() === 'desc' ? -1 : 1;
      }

      const users = await User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.status(200).json({
        data: users,
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

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('-password');
        
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const newUser = await User.create(req.body);

      const userResponse = newUser.toObject();
      delete userResponse.password;
      
      res.status(201).json(userResponse);
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        return res.status(400).json({ 
          message: 'Username or email already exists' 
        });
      }
      res.status(400).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      // Prevent password update through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Username or email already exists' 
        });
      }
      res.status(400).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.userId);

      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = UserController;