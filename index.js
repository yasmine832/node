//from https://www.youtube.com/watch?v=-MTSQjw5DrM
// this code is takne from the tutorial and modified to fit the needs of the project

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');//todo
require('dotenv').config();

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const postRoutes = require('./src/routes/postRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); //use express middleware to parse json data
app.use(express.urlencoded({ extended: false })); //form


// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);

// Root route for API documentation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.set("strictQuery", false); //to avoid deprecation warning
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected"); //if connection successful
        //call api on server after db
        app.listen(process.env.PORT, () => {
          console.log(`Server running on http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.log(err));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

module.exports = app; //export app for testing