const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false
  },
  tasteProfile: {
    type: String,
    default: ''
  },
  tasteProfileUpdatedAt: {
    type: Date
  },
  lastProfileRatingsCount: {
    type: Number,
    default: 0
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  preferenceMovieIds: {
    type: [Number],
    default: []
  },
  ratingsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
