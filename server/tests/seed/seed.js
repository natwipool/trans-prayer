const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Playlist } = require('./../../models/playlist');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const playlists = [{
  _id: new ObjectID(),
  name: 'First test playlist',
  precepts: ['คำบูชาพระรัตนตรัย', 'ปุพพภาคนมการ', 'ท๎วัตติงสาการปาฐะ'],
  _creator: userOneId
}, {
  _id: new ObjectID(),
  name: 'Second test playlist',
  precepts: ['พุทธาภิถุติง', 'ธัมมาภิถุติง', 'สังฆาภิถุติง'],
  _creator: userTwoId
}];

const users = [{
  _id: userOneId,
  email: 'natwipool@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, '123abc').toString()
  }]
}, {
  _id: userTwoId,
  email: 'somsak@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, '123abc').toString()
  }]
}];

const populatePlaylists = (done) => {
  Playlist.remove({}).then(() => {
    return Playlist.insertMany(playlists);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports= { playlists, populatePlaylists, users, populateUsers };