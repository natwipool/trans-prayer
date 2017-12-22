var { mongoose } = require('./../db/mongoose');

var Playlist = mongoose.model('Playlist', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  precepts: [{
    type: String
  }]
})

module.exports = { Playlist };
