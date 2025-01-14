const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },

  email: { 
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    validate: {
      validator: async function (email) {
        try {
          const user = await this.constructor.findOne({ email });
          return !user; // check if mail already in use
        } catch (error) {
          throw new Error('Error occurred while validating email');
        }
      },
      message: 'This email already exists',
    } 
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function (password) {
        //require numbers and special characters
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);//is oK? 
      },
      message: 'Password must contain at least: 1 letter, 1 number, 1 special character!',
    },
    select: false, // hide password from default queries
  },
  firstName: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        return !/\d/.test(value); // no nrs
      },
      message: 'First name cannot have numbers',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  birthday: {
    type: String,
    required: [true, 'Birthday is required'],
    validate: [
      {
        validator: function (value) {
          const birthdayRegex = /^\d{2}-\d{2}-\d{4}$/;
          return birthdayRegex.test(value);
        },
        message: 'Please enter a valid birthday in format DD-MM-YYYY',
      },
      {
        validator: function (value) {
          const today = new Date();
          const ageLimitDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
          return new Date(value) < ageLimitDate; //  16
        },
        message: 'You must be 16+ to create an account.',
      },
    ],
  },

  phoneNumber: {
    type: String,
    required: function() {
      return !this.landline; //landline?
    },
    validate: {
      validator: function(value) {
        const phoneNumberRegex = /^\+\d{1,3} \d{3} \d{2} \d{2} \d{2}$/;
        return phoneNumberRegex.test(value);
      },
      message: 'Please enter a valid phone number format: +XX YYY YY YY YY',
    },
    unique: true,
  },
  landline: {
    type: String,
    required: function() {
      return !this.phoneNumber;
    },
    validate: {
      validator: function(value) {
        const landlineNumberRegex = /^\+\d{1,3} \d{3} \d{2} \d{2} \d{2}$/;
        return landlineNumberRegex.test(value);
      },
      message: 'Please enter a valid landline number format: +XX YYY YY YY YY',
    },
    unique: true,
  },
  address: {
    street: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    municipality: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
      enum: ['Belgium', 'Netherlands', 'Luxembourg'],
    },
    postalCode: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (value) {
          const postalCodeRegex = /^[0-9]{4}$/;
          return postalCodeRegex.test(value);
        },
        message: 'Please enter a valid postal code (4 digits)',
      },
    },
  },

},
{
  timestamps: true,
}

);

const User = mongoose.model('User', userSchema);

module.exports = User;