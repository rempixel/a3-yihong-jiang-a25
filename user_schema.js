const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  username: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false, // Made optional for OAuth users
    default: ''
  },
  birthday: {
    type: String,
    required: false, // Made optional for OAuth users
    default: ''
  },
  age: {
    type: Number,
    required: false, // Made optional for OAuth users
    default: 0
  },
  zodiac: {
    type: String,
    required: false, // Made optional for OAuth users
    default: ''
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model("User", user_schema);