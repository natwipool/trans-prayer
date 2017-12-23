const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { TransPrayer } = require('./../models/trans-prayer');
const { Playlist } = require('./../models/playlist');

const playlists = [{
  _id: new ObjectID(),
  name: 'First test playlist',
  precepts: ['คำบูชาพระรัตนตรัย', 'ปุพพภาคนมการ', 'ท๎วัตติงสาการปาฐะ']
}, {
  _id: new ObjectID(),
  name: 'Second test playlist',
  precepts: ['พุทธาภิถุติง', 'ธัมมาภิถุติง', 'สังฆาภิถุติง']
}]

beforeEach((done) => {
  Playlist.remove({}).then(() => {
    return Playlist.insertMany(playlists);
  }).then(() => done());
});

describe('GET /trans-prayer', () => {
  it('should get all trans-prayers', (done) => {
    request(app)
    .get('/trans-prayer')
    .expect(200)
    .expect((res) => {
      expect(res.body.prayers.length).toBe(39);
    })
    .end(done);
  }); 
});

describe('POST /playlists', () => {
  it('should create a new playlist', (done) => {
    var name = 'Test Playlist';
    var precepts = ['คำบูชาพระรัตนตรัย', 'ปุพพภาคนมการ', 'พุทธาภิถุติง', 'ธัมมาภิถุติง', 'สังฆาภิถุติง'];

    request(app)
      .post('/playlists')
      .send({ name, precepts })
      .expect(200)
      .expect((res) => {
        expect(res.body.playlist.name).toBe(name);
        expect(res.body.playlist.precepts).toEqual(precepts);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Playlist.find({ name }).then((playlists) => {
          expect(playlists.length).toBe(1);
          expect(playlists[0].name).toBe(name);
          expect(playlists[0].precepts).toEqual(expect.arrayContaining(precepts));
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create playlist with invalid data', (done) => {
    request(app)
      .post('/playlists')
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

describe('GET /playlists', () => {
  it('should get all playlists', (done) => {
    request(app)
      .get('/playlists')
      .expect(200)
      .expect((res) => {
        expect(res.body.playlists.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /playlists/:id', () => {
  it('should get playlist by id', (done) => {
    request(app)
      .get(`/playlists/${playlists[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(playlists[0].name)
        expect(res.body.playlists[0].precept).toBe(playlists[0].precepts[0])
      })
      .end(done);
  });

  it('should get 404 if playlists not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/playlists/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should get 404 for invalid object ids', (done) => {
    request(app)
      .get('/playlists/123abc')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /playlists/:id', () => {
  it('should remove a playlists', (done) => {
    var hexId = playlists[1]._id.toHexString();

    request(app)
      .delete(`/playlists/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.playlist._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Playlist.findById(hexId).then((playlist) => {
          expect(playlist).toBeFalsy();
          done();
        }).catch((e) => done(e));
      })

  });

  it('should return 404 if playlists not found', (done) => {
    var id = new ObjectID().toHexString();

    request(app)
      .delete(`/playlists/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid object ids', (done) => {
    request(app)
      .delete('/playlists/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /playlists/:id', () => {
  it('should update the playlist', (done) => {
    var hexId = playlists[0]._id.toHexString();
    var name = 'test update playlist name';
    var add = ['123', 'abc'];
    var remove = ['คำบูชาพระรัตนตรัย', 'ท๎วัตติงสาการปาฐะ'];

    request(app)
      .patch(`/playlists/${hexId}`)
      .send({ name, add, remove })
      .expect(200)
      .expect((res) => {
        expect(res.body.playlist.name).toBe(name);
        expect(res.body.playlist.precepts).toEqual(expect.arrayContaining(add));
        expect(res.body.playlist.precepts).not.toEqual(expect.arrayContaining(remove));
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Playlist.findById(hexId).then((playlist) => {
          expect(playlist.name).toBe(name);
          expect(playlist.precepts).toEqual(expect.arrayContaining(add));
          expect(playlist.precepts).not.toEqual(expect.arrayContaining(remove));
          done();
        }).catch((e) => done(e));  
      });
  });
});
