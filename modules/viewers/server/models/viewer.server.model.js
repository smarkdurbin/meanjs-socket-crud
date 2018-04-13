'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path'),
    config = require(path.resolve('./config/config')),
    chalk = require('chalk');

/**
 * Viewer Schema
 */
var ViewerSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    viewer_name: {
        type: String,
        trim: true,
        required: 'Viewer Name cannot be blank'
    },
    display_name: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    updated: {
        type: Date,
        default: Date.now
    },
    screenshot_updated: {
        type: Date,
        default: Date.now
    },
    screen_orientation: {
        type: String,
        enum: ['Portrait', 'Landscape'],
        required: 'Screen Orientation is required'
    },
    type: {
        type: String,
        enum: ['Room', 'Custom', 'Agenda', 'Directional', 'Info', 'Event'],
        required: 'Sign Type is required'
    },
    published: {
        type: Boolean,
        required: 'Please indicate active status of this viewer'
    },
    active: {
        type: Boolean,
        required: 'Please indicate active status of this viewer'
    },
});

// ViewerSchema.statics.seed = seed;

ViewerSchema.pre('save', function (next) {
    if(this.display_name == null || this.display_name == "") {
        this.display_name = this.viewer_name;
    }
    next();
});

// Virtual for viewer's URL
ViewerSchema
    .virtual('url')
    .get(function() {
        return '/viewers/' + this._id;
    });

// Virtual for viewer's cached screenshot
ViewerSchema
    .virtual('cached_screenshot_url')
    .get(function() {
        return '/_cache/_images/_viewer_screenshots/' + this.name + '.png';
    });

// Virtual for viewer's live screenshot
ViewerSchema
    .virtual('live_screenshot_url')
    .get(function() {
        return 'http://192.168.0.12:8080/SampleService/api/screenshot/' + this.name;
    });

mongoose.model('Viewer', ViewerSchema);

/**
 * Seeds the User collection with document (Viewer)
 * and provided options.
 */
function seed(doc, options) {
    var Viewer = mongoose.model('Viewer');

    return new Promise(function(resolve, reject) {

        skipDocument()
            .then(findAdminUser)
            .then(add)
            .then(function(response) {
                return resolve(response);
            })
            .catch(function(err) {
                return reject(err);
            });

        function findAdminUser(skip) {
            var User = mongoose.model('User');

            return new Promise(function(resolve, reject) {
                if (skip) {
                    return resolve(true);
                }

                User
                    .findOne({
                        roles: { $in: ['admin'] }
                    })
                    .exec(function(err, admin) {
                        if (err) {
                            return reject(err);
                        }

                        doc.user = admin;

                        return resolve();
                    });
            });
        }

        function skipDocument() {
            return new Promise(function(resolve, reject) {
                Viewer
                    .findOne({
                        title: doc.title
                    })
                    .exec(function(err, existing) {
                        if (err) {
                            return reject(err);
                        }

                        if (!existing) {
                            return resolve(false);
                        }

                        if (existing && !options.overwrite) {
                            return resolve(true);
                        }

                        // Remove Viewer (overwrite)

                        existing.remove(function(err) {
                            if (err) {
                                return reject(err);
                            }

                            return resolve(false);
                        });
                    });
            });
        }

        function add(skip) {
            return new Promise(function(resolve, reject) {
                if (skip) {
                    return resolve({
                        message: chalk.yellow('Database Seeding: Viewer\t' + doc.title + ' skipped')
                    });
                }

                var viewer = new Viewer(doc);

                viewer.save(function(err) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve({
                        message: 'Database Seeding: Viewer\t' + viewer.title + ' added'
                    });
                });
            });
        }
    });
}
