const mongoose = require('mongoose');

var Playlist = mongoose.model('Playlist', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  precepts: [{
    type: String
  }],
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

module.exports = { Playlist };
