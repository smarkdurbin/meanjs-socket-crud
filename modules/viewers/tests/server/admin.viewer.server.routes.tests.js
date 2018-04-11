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
describe('Viewer Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an viewer if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new viewer
        agent.post('/api/viewers')
          .send(viewer)
          .expect(200)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Handle viewer save error
            if (viewerSaveErr) {
              return done(viewerSaveErr);
            }

            // Get a list of viewers
            agent.get('/api/viewers')
              .end(function (viewersGetErr, viewersGetRes) {
                // Handle viewer save error
                if (viewersGetErr) {
                  return done(viewersGetErr);
                }

                // Get viewers list
                var viewers = viewersGetRes.body;

                // Set assertions
                (viewers[0].user._id).should.equal(userId);
                (viewers[0].title).should.match('Viewer Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an viewer if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new viewer
        agent.post('/api/viewers')
          .send(viewer)
          .expect(200)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Handle viewer save error
            if (viewerSaveErr) {
              return done(viewerSaveErr);
            }

            // Update viewer title
            viewer.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing viewer
            agent.put('/api/viewers/' + viewerSaveRes.body._id)
              .send(viewer)
              .expect(200)
              .end(function (viewerUpdateErr, viewerUpdateRes) {
                // Handle viewer update error
                if (viewerUpdateErr) {
                  return done(viewerUpdateErr);
                }

                // Set assertions
                (viewerUpdateRes.body._id).should.equal(viewerSaveRes.body._id);
                (viewerUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an viewer if no title is provided', function (done) {
    // Invalidate title field
    viewer.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new viewer
        agent.post('/api/viewers')
          .send(viewer)
          .expect(422)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Set message assertion
            (viewerSaveRes.body.message).should.match('Title cannot be blank');

            // Handle viewer save error
            done(viewerSaveErr);
          });
      });
  });

  it('should be able to delete an viewer if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new viewer
        agent.post('/api/viewers')
          .send(viewer)
          .expect(200)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Handle viewer save error
            if (viewerSaveErr) {
              return done(viewerSaveErr);
            }

            // Delete an existing viewer
            agent.delete('/api/viewers/' + viewerSaveRes.body._id)
              .send(viewer)
              .expect(200)
              .end(function (viewerDeleteErr, viewerDeleteRes) {
                // Handle viewer error error
                if (viewerDeleteErr) {
                  return done(viewerDeleteErr);
                }

                // Set assertions
                (viewerDeleteRes.body._id).should.equal(viewerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single viewer if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new viewer model instance
    viewer.user = user;
    var viewerObj = new Viewer(viewer);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new viewer
        agent.post('/api/viewers')
          .send(viewer)
          .expect(200)
          .end(function (viewerSaveErr, viewerSaveRes) {
            // Handle viewer save error
            if (viewerSaveErr) {
              return done(viewerSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (viewerInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
