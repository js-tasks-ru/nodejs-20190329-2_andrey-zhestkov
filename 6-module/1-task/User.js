const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [
      {
        validator: function(v) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(v);
        },
      },
    ],
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
}, {timestamps: {createdAt: 'createdDate', updatedAt: 'updatedDate'}});

module.exports = mongoose.model('User', schema);
