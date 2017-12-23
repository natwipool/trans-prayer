const _ = require('lodash');
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

app.post('/playlists', (req, res) => {
  var playlist = new Playlist({
    name: req.body.name,
    precepts: req.body.precepts
  });

  playlist.save(playlist).then((playlist) => {
    res.send({ playlist });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/playlists', (req, res) => {
  Playlist.find().then((playlists) => {
    res.send({ playlists });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/playlists/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findById(id).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }  
    
    return Promise.all([
        doc,
        TransPrayer.find({
          precept: {
            $in: doc.precepts
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

app.delete('/playlists/:id', (req, res) => {
  var id = req.params.id;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findByIdAndRemove(id).then((playlist) => {
    if (!playlist) {
      return res.status(404).send();
    }

    res.send({ playlist });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/playlists/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'remove', 'add']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findById(id)
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send();
      }

      if (body.name) {
        playlist.name = body.name;
      }

      if (body.remove) {
        _.pullAll(playlist.precepts, body.remove);
      }

      if (body.add) {
        playlist.precepts = _.concat(playlist.precepts, body.add);
      }

      return Playlist.findByIdAndUpdate(
        id,
        {
          $set: playlist
        },
        {
          new: true
        }
      );
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send();
      }

      res.send({ playlist });
    })
    .catch(e => {
      res.status(400).send();
    });
});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };