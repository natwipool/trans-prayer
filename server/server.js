const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('mongoose');
const { TransPrayer } = require('./models/trans-prayer');

var app = express();
const port = process.env.PORT || 3000;

app.get('/trans-prayer', (req, res) => {
  TransPrayer.find().then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/1', (req, res) => {
  TransPrayer.find({
    category: 'บททำวัตร'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/2', (req, res) => {
  TransPrayer.find({
    category: 'บททั่วไป'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/trans-prayer/3', (req, res) => {
  TransPrayer.find({
    category: 'บทกรวดน้ำ'
  }).then((prayers) => {
    res.send({ prayers });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});