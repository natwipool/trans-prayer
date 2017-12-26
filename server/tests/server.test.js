const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { TransPrayer } = require('./../models/trans-prayer');
const { Playlist } = require('./../models/playlist');
const { User } = require('./../models/user');
const { playlists, populatePlaylists, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populatePlaylists);

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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
  it('should get playlists', (done) => {
    request(app)
      .get('/playlists')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.playlists.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /playlists/:id', () => {
  it('should return playlist by id', (done) => {
    request(app)
      .get(`/playlists/${playlists[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(playlists[0].name)
        expect(res.body.playlists[0].precept).toBe(playlists[0].precepts[0])
      })
      .end(done);
  });

  it('should not return playlist created by other user', (done) => {
    request(app)
      .get(`/playlists/${playlists[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if playlists not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/playlists/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .get('/playlists/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /playlists/:id', () => {
  it('should remove a playlists', (done) => {
    var hexId = playlists[1]._id.toHexString();

    request(app)
      .delete(`/playlists/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
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
      });
  });

  it('should not remove a playlists by other user', (done) => {
    var hexId = playlists[0]._id.toHexString();

    request(app)
      .delete(`/playlists/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Playlist.findById(hexId).then((playlist) => {
          expect(playlist).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if playlists not found', (done) => {
    var id = new ObjectID().toHexString();

    request(app)
      .delete(`/playlists/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid object ids', (done) => {
    request(app)
      .delete('/playlists/123')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /playlists/:id', () => {
  it('should update the playlist', (done) => {
    var hexId = playlists[0]._id.toHexString();
    var name = 'test update playlist name';
    var add = ['ภารสุตตคาถา', 'ภัทเทกรัตตคาถา'];
    var remove = ['คำบูชาพระรัตนตรัย', 'ท๎วัตติงสาการปาฐะ'];

    request(app)
      .patch(`/playlists/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not update the playlist created by oter user', (done) => {
    var hexId = playlists[0]._id.toHexString();
    var name = 'test update playlist name';
    var add = ['ภารสุตตคาถา', 'ภัทเทกรัตตคาถา'];
    var remove = ['คำบูชาพระรัตนตรัย', 'ท๎วัตติงสาการปาฐะ'];

    request(app)
      .patch(`/playlists/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ name, add, remove })
      .expect(404)
      .end(done);
  });
});

describe('GET users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'test@email.com';
    var password = 'abcdefg';
    
    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({ email: 'abc', password: '123'})
      .expect(400)
      .end(done);
  });

  it('should not create user if email already used', (done) => {
    request(app)
      .post('/users')
      .send({ email: users[0].email, password: '1234567' })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done();
        }).catch((e) => done(e));
      });
  });

  it('shoule reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'wrongPass'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email: users[0].email }).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
