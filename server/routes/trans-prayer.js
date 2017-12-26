const express = require('express');
const transPrayerRouter = express.Router();
const { ObjectID } = require('mongodb');

const { TransPrayer } = require('./../models/trans-prayer');

transPrayerRouter.get('/', (req, res) => {
  TransPrayer.find().then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

transPrayerRouter.get('/part01', (req, res) => {
  TransPrayer.find({
    category: 'ภาค ๑ คำทำวัตรเช้า-เย็น'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

transPrayerRouter.get('/part02', (req, res) => {
  TransPrayer.find({
    category: 'ภาต ๒ บทสวดมนต์พิเศษบางบท'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

transPrayerRouter.get('/part03', (req, res) => {
  TransPrayer.find({
    category: 'ภาคผนวก'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

transPrayerRouter.get('/:id', (req, res) => {
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

module.exports = { transPrayerRouter };