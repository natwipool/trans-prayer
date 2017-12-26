require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('mongoose');
const { transPrayerRouter } = require('./routes/trans-prayer')
const { playlistRouter } = require('./routes/playlist');
const { userRouter } = require('./routes/user');
// const { transPrayers } = require('./db/trans-prayer-db');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use('/trans-prayer', transPrayerRouter);
app.use('/playlists', playlistRouter);
app.use('/users', userRouter);

// TransPrayer.remove().then(() => {
//   TransPrayer.insertMany(transPrayers);
// }).catch((e) => {
//   console.log("Error:", e);
// });

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };