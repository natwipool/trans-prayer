const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { TransPrayer } = require('./../models/trans-prayer');
const { Playlist } = require('./../models/playlist');

const playlists = [{
  name: 'First test playlist',
  list: ['บทสวดมนต์ ๑', 'บทสวดมนต์ ๒', 'บทสวดมนต์ ๓']
}, {
  name: 'Second test playlist',
  list: ['บทสวดมนต์ ๔', 'บทสวดมนต์ ๕', 'บทสวดมนต์ ๖']
}]

beforeEach((done) => {
  Playlist.remove({}).then(() => {
    return Playlist.insertMany(playlists);
  }).then(() => done());
});

// describe('GET /trans-prayer', () => {

// });

describe('POST /playlist', () => {
  it('should create a new playlist', (done) => {
    var name = 'Test Playlist';
    var list = ['คำบูชาพระรัตนตรัย', 'ปุพพภาคนมการ', 'พุทธาภิถุติง', 'ธัมมาภิถุติง', 'สังฆาภิถุติง'];

    request(app)
      .post('/playlist')
      .send({ name, list })
      .expect(200)
      .expect((res) => {
        expect(res.body.playlist.name).toBe(name);
        expect(res.body.playlist.list).toEqual(list);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Playlist.find({ name }).then((playlists) => {
          expect(playlists.length).toBe(1);
          expect(playlists[0].name).toBe(name);
          expect(playlists[0].list).toEqual(expect.arrayContaining(list));
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create playlist with invalid data', (done) => {
    request(app)
      .post('/playlist')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Playlist.find().then((playlists) => {
          expect(playlists.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /playlist', () => {
  it('should get all playlists', (done) => {
    request(app)
      .get('/playlist')
      .expect(200)
      .expect((res) => {
        expect(res.body.playlists.length).toBe(2);
      })
      .end(done);
  });

});