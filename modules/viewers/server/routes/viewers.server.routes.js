'use strict';

/**
 * Module dependencies
 */
var viewersPolicy = require('../policies/viewers.server.policy'),
  viewers = require('../controllers/viewers.server.controller');

module.exports = function (app) {
  // Viewers collection routes
  app.route('/api/viewers').all(viewersPolicy.isAllowed)
    .get(viewers.list)
    .post(viewers.create);

  // Single viewer routes
  app.route('/api/viewers/:viewerId').all(viewersPolicy.isAllowed)
    .get(viewers.read)
    .put(viewers.update)
    .delete(viewers.delete);

  // Finish by binding the viewer middleware
  app.param('viewerId', viewers.viewerByID);
};
