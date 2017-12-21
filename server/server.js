const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

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

app.get('/trans-prayer/part01', (req, res) => {
  TransPrayer.find({
    category: 'ภาค ๑ คำทำวัตรเช้า-เย็น'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/part02', (req, res) => {
  TransPrayer.find({
    category: 'ภาต ๒ บทสวดมนต์พิเศษบางบท'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/part03', (req, res) => {
  TransPrayer.find({
    category: 'ภาคผนวก'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  TransPrayer.findById(id).then((prayer) => {
    if (!prayer) {
      return res.status(404).send();
    }

    res.send({ prayer });
  }).catch((e) => {
    res.status(400).send();
  });
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

app.get('/playlist/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findById(id).then((doc) => {
    // if (!doc) {
    //   return res.status(404).send();
    // }  
    
    return Promise.all([
        doc,
        TransPrayer.find({
          precept: {
            $in: doc.list
          }
        })
      ]);
    }).then(([doc, playlists]) => {
      res.send({
        name: doc.name,
        playlists
      });
    }).catch((e) => {
      res.status(400).send(e);
    });
});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };