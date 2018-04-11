'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Viewer = mongoose.model('Viewer'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  viewer;

/**
 * Viewer routes tests
 */
describe('Viewer CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new viewer
    user.save()
      .then(function () {
        viewer = {
          title: 'Viewer Title',
          content: 'Viewer Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an viewer if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/viewers')
          .send(viewer)
          .expect(403)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Call the assertion callback
            done(viewerSaveErr);
          });

      });
  });

  it('should not be able to save an viewer if not logged in', function (done) {
    agent.post('/api/viewers')
      .send(viewer)
      .expect(403)
      .end(function (viewerSaveErr, viewerSaveRes) {
        // Call the assertion callback
        done(viewerSaveErr);
      });
  });

  it('should not be able to update an viewer if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/viewers')
          .send(viewer)
          .expect(403)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Call the assertion callback
            done(viewerSaveErr);
          });
      });
  });

  it('should be able to get a list of viewers if not signed in', function (done) {
    // Create new viewer model instance
    var viewerObj = new Viewer(viewer);

    // Save the viewer
    viewerObj.save(function () {
      // Request viewers
      agent.get('/api/viewers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single viewer if not signed in', function (done) {
    // Create new viewer model instance
    var viewerObj = new Viewer(viewer);

    // Save the viewer
    viewerObj.save(function () {
      agent.get('/api/viewers/' + viewerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', viewer.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single viewer with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/viewers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Viewer is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single viewer which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent viewer
    agent.get('/api/viewers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No viewer with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an viewer if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/viewers')
          .send(viewer)
          .expect(403)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Call the assertion callback
            done(viewerSaveErr);
          });
      });
  });

  it('should not be able to delete an viewer if not signed in', function (done) {
    // Set viewer user
    viewer.user = user;

    // Create new viewer model instance
    var viewerObj = new Viewer(viewer);

    // Save the viewer
    viewerObj.save(function () {
      // Try deleting viewer
      agent.delete('/api/viewers/' + viewerObj._id)
        .expect(403)
        .end(function (viewerDeleteErr, viewerDeleteRes) {
          // Set message assertion
          (viewerDeleteRes.body.message).should.match('User is not authorized');

          // Handle viewer error error
          done(viewerDeleteErr);
        });

    });
  });

  it('should be able to get a single viewer that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new viewer
          agent.post('/api/viewers')
            .send(viewer)
            .expect(200)
            .end(function (viewerSaveErr, viewerSaveRes) {
              // Handle viewer save error
              if (viewerSaveErr) {
                return done(viewerSaveErr);
              }

              // Set assertions on new viewer
              (viewerSaveRes.body.title).should.equal(viewer.title);
              should.exist(viewerSaveRes.body.user);
              should.equal(viewerSaveRes.body.user._id, orphanId);

              // force the viewer to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the viewer
                    agent.get('/api/viewers/' + viewerSaveRes.body._id)
                      .expect(200)
                      .end(function (viewerInfoErr, viewerInfoRes) {
                        // Handle viewer error
                        if (viewerInfoErr) {
                          return done(viewerInfoErr);
                        }

                        // Set assertions
                        (viewerInfoRes.body._id).should.equal(viewerSaveRes.body._id);
                        (viewerInfoRes.body.title).should.equal(viewer.title);
                        should.equal(viewerInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single viewer if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new viewer model instance
    var viewerObj = new Viewer(viewer);

    // Save the viewer
    viewerObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/viewers/' + viewerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', viewer.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single viewer, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'viewerowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Viewer
    var _viewerOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _viewerOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Viewer
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new viewer
          agent.post('/api/viewers')
            .send(viewer)
            .expect(200)
            .end(function (viewerSaveErr, viewerSaveRes) {
              // Handle viewer save error
              if (viewerSaveErr) {
                return done(viewerSaveErr);
              }

              // Set assertions on new viewer
              (viewerSaveRes.body.title).should.equal(viewer.title);
              should.exist(viewerSaveRes.body.user);
              should.equal(viewerSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the viewer
                  agent.get('/api/viewers/' + viewerSaveRes.body._id)
                    .expect(200)
                    .end(function (viewerInfoErr, viewerInfoRes) {
                      // Handle viewer error
                      if (viewerInfoErr) {
                        return done(viewerInfoErr);
                      }

                      // Set assertions
                      (viewerInfoRes.body._id).should.equal(viewerSaveRes.body._id);
                      (viewerInfoRes.body.title).should.equal(viewer.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (viewerInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Viewer.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
