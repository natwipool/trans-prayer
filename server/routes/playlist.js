const express = require('express');
const playlistRouter = express.Router();
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { TransPrayer } = require('./../models/trans-prayer');
const { Playlist } = require('./../models/playlist');
const { authenticate } = require('./../middleware/authenticate');

playlistRouter.post('/',authenticate, (req, res) => {
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

playlistRouter.get('/', authenticate, (req, res) => {
  Playlist.find({
    _creator: req.user._id
  }).then((playlists) => {
    res.send({ playlists });
  }).catch((e) => {
    res.status(400).send();
  });
});

playlistRouter.get('/:id', authenticate, (req, res) => {
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

playlistRouter.delete('/:id', authenticate,(req, res) => {
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

playlistRouter.patch('/:id', authenticate, (req, res) => {
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

module.exports = { playlistRouter };