var { mongoose } = require('./../db/mongoose');

var TransPrayer = mongoose.model('TransPrayer', {
  precept: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  category: {
    type: String,
    enum: ['บททำวัตร', 'บททั่วไป', 'บทกรวดน้ำ'],
    required: true
  },
  lyrics: [{
    type: String
  }]
});

// var prayer = new TransPrayer({
//   precept: 'บทนมัสการพระรัตนตรัย',
//   category: 'บททั่วไป',
//   lyrics: [
//             'อรหํ สมฺมา สมฺพุทฺโธ ภควา', 'พุทฺธํ ภควนฺตํ อภิวาเทมิ', '(กราบ)',
//             'สวาขาโต ภควตา ธมฺโม', 'ธมฺมํ นมสฺสามิ', '(กราบ)',
//             'สุปฏิปนฺโน ภควโต สาวกสงฺโฆ', 'สงฺฆงฺนมามิ', '(กราบ)'
//           ]
// });

// var prayer = new TransPrayer({
//   precept: 'บทกรวดน้ำอิมินา',
//   category: 'บทกรวดน้ำ',
//   lyrics: [
//             'อิมินา ปุณฺญกมฺเมนะ', 'อุปชฺฌายา คุณุตตรา',
//             'อาจะริยูปะการา จะ', 'มาตาปิตา จะ ญาตะกา',
//             'สุริโย จันทิมา ราชา', 'คุณะวันตา นะราปิ จะ'
//           ]
// });

// prayer.save().then((prayer) => {
//   console.log(prayer);
// }, (e) => {
//   console.log(e);
// });

module.exports = { TransPrayer };