require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('mongoose');
const { transPrayers } = require('./db/trans-prayer-db');
const { TransPrayer } = require('./models/trans-prayer');
const { Playlist } = require('./models/playlist');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

TransPrayer.remove().then(() => {
  TransPrayer.insertMany(transPrayers);
}).catch((e) => {
  console.log("Error:", e);
});

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

app.post('/playlists',authenticate, (req, res) => {
  var playlist = new Playlist({
    name: req.body.name,
    precepts: req.body.precepts,
    _creator: req.user._id
  });

  playlist.save(playlist).then((playlist) => {
    res.send({ playlist });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/playlists', authenticate, (req, res) => {
  Playlist.find({
    _creator: req.user._id
  }).then((playlists) => {
    res.send({ playlists });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/playlists/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findOne({
    _id: id,
    _creator: req.user._id // user who currently login
  })
    .then((doc) => {
      if (!doc) {
        return res.status(404).send();
      }

      return TransPrayer.find({
        precept: {
          $in: doc.precepts
        }
      }).then((playlists) => {
        res.send({ 
          name: doc.name,
          playlists 
        });
      });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

app.delete('/playlists/:id', authenticate,(req, res) => {
  var id = req.params.id;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((playlist) => {
    if (!playlist) {
      return res.status(404).send();
    }

    res.send({ playlist });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/playlists/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'remove', 'add']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Playlist.findOne({
    _id: id,
    _creator: req.user._id
  })
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

      return Playlist.findOneAndUpdate(
        {
          _id: id,
          _creator: req.user._id
        },
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

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send();
  }).catch(() => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };