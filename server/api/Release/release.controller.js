/* Created by Leo on 03/05/2016. */
'use strict';

var _ = require('lodash');
var Release = require('./release.model');

exports.isRelease = function(id) {
  return /^.*?v\d+$/.test(id);
};


exports.show = function(id, cb) {
  Release.findById(id, function (err, release) {
    if (err) return cb(err);
    if (!release) return cb(new Error('Release not found!'));
    cb(null, release.sequence);
  });
};

exports.publish = function(sequence, cb) {
  if (!_.has(sequence, 'version'))
    sequence.version = 0;
  sequence.version++;
  sequence.save(function (err) {
    if (err) return cb(err);
    var data = {
      _id: sequence._id + 'v' + sequence.version,
      sequence: sequence
    };
    Release.create(data, function (err, release) {
      if (err) return cb(err);
      return cb(null, release);
    });
  });
};
