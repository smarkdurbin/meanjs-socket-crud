'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Viewer = mongoose.model('Viewer'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an viewer
 */
exports.create = function(req, res) {
    var viewer = new Viewer(req.body);
    viewer.user = req.user;
    console.log(req.body);

    viewer.save(function(err) {
        if (err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            console.log(viewer);
            var socketio = req.app.get('socketio'); // take out socket instance from the app container
            socketio.sockets.emit('viewer.created', viewer); // emit an event for all connected clients
            res.json(viewer);
        }
    });
};

/**
 * Show the current viewer
 */
exports.read = function(req, res) {
    // convert mongoose document to JSON
    var viewer = req.viewer ? req.viewer.toJSON() : {};

    // Add a custom field to the Viewer, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Viewer model.
    viewer.isCurrentUserOwner = !!(req.user && viewer.user && viewer.user._id.toString() === req.user._id.toString());

    res.json(viewer);
};

/**
 * Update an viewer
 */
exports.update = function(req, res) {
    var viewer = req.viewer;

    viewer.viewer_name = req.body.viewer_name;
    viewer.display_name = req.body.display_name;
    viewer.notes = req.body.notes;
    viewer.type = req.body.type;
    viewer.screen_orientation = req.body.screen_orientation;
    viewer.updated = Date.now();
    viewer.published = req.body.published;
    viewer.active = req.body.active;

    viewer.save(function(err) {
        if (err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            var socketio = req.app.get('socketio'); // take out socket instance from the app container
            socketio.sockets.emit('viewer.updated', viewer); // emit an event for all connected clients
            res.json(viewer);
        }
    });
};

/**
 * Delete an viewer
 */
exports.delete = function(req, res) {
    var viewer = req.viewer;

    viewer.remove(function(err) {
        if (err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            var socketio = req.app.get('socketio'); // take out socket instance from the app container
            socketio.sockets.emit('viewer.deleted', viewer); // emit an event for all connected clients
            res.json(viewer);
        }
    });
};

/**
 * List of Viewers
 */
exports.list = function(req, res) {
    Viewer.find().sort('-created').populate('user', 'displayName').exec(function(err, viewers) {
        if (err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(viewers);
        }
    });
};

/**
 * Viewer middleware
 */
exports.viewerByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Viewer is invalid'
        });
    }

    Viewer.findById(id).populate('user', 'displayName').exec(function(err, viewer) {
        if (err) {
            return next(err);
        }
        else if (!viewer) {
            return res.status(404).send({
                message: 'No viewer with that identifier has been found'
            });
        }
        req.viewer = viewer;
        next();
    });
};
