const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('mongoose');
const { TransPrayer } = require('./models/trans-prayer');
const { Playlist } = require('./models/playlist');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/trans-prayer', (req, res) => {
  TransPrayer.find().then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/1', (req, res) => {
  TransPrayer.find({
    category: 'ภาค ๑ คำทำวัตรเช้า-เย็น'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/2', (req, res) => {
  TransPrayer.find({
    category: 'ภาต ๒ บทสวดมนต์พิเศษบางบท'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/3', (req, res) => {
  TransPrayer.find({
    category: 'ภาคผนวก'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.post('/playlist', (req, res) => {
  var playlist = new Playlist({
    name: req.body.name,
    list: req.body.list
  });

  playlist.save(playlist).then((playlist) => {
    res.send({ playlist });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/playlist', (req, res) => {
  Playlist.find().then((playlists) => {
    res.send({ playlists });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };