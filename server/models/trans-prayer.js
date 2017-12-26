const { mongoose } = require('./../db/mongoose');

var TransPrayer = mongoose.model('TransPrayer', {
  precept: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  category: {
    type: String,
    enum: ['ภาค ๑ คำทำวัตรเช้า-เย็น', 'ภาต ๒ บทสวดมนต์พิเศษบางบท', 'ภาคผนวก'],
    required: true
  }, 
  sub_category: {
    type: String
  },
  lyrics: [{
    type: String
  }],
  filename: {
    type: String,
    default: null
  },
  duration: {
    type: Number
  }
});

module.exports = { TransPrayer };