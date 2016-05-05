/* Created by Leo on 03/05/2016. */
'use strict';

var _ = require('lodash');
var Release = require('./release.model');

exports.isRelease = function(id) {
  return /^.*?v\d+$/.test(id);
};

exports.index = function(text, cb) {
  var rgx = new RegExp(text, 'i');
  Release.find({}, '-sequence')
    .or([{ 'title': { $regex: rgx }}, { 'desc': { $regex: rgx }}])
    .sort({title: 1, version: -1})
    .exec(function(err, releases) {
      cb(err, releases);
    });
};

exports.show = function(id, cb) {
  Release.findById(id, function (err, release) {
    if (err) return cb(err);
    if (!release) return cb(new Error('Release not found!'));
    cb(null, release);
  });
};

exports.publish = function(sequence, cb) {
  if (!_.isNumber(sequence.version))
    sequence.version = 0;
  sequence.version++;
  sequence.save(function (err) {
    if (err) return cb(err);
    var data = {
      _id: sequence._id + 'v' + sequence.version,
      title: sequence.title,
      desc: sequence.desc,
      version: sequence.version,
      sequence: sequence
    };
    Release.create(data, function (err, release) {
      if (err) return cb(err);
      return cb(null, sequence);
    });
  });
};

exports.releases = function(id, cb) {
  var rgx = new RegExp('^'+id+'v', 'i');
  Release.find({'_id': { $regex: rgx }}, '-sequence')
    .sort({version: -1})
    .exec(function(err, releases) {
      cb(err, releases);
    });
};
