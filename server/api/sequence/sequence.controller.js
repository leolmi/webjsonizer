/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Sequence = require('./sequence.model');

function checkUser(req, res){
  var check = (req.user && req.user._id);
  if (!check) handleError(res, 'Undefined user!');
  return check;
}

function handleError(res, err) {
  if (typeof err != 'string')
    err = err.message;
  return res.send(500, err);
}


// Get list of sequences
exports.index = function(req, res) {
  if (!checkUser(req, res)) return;
  Sequence.find({owner: req.user._id}, function (err, sequences) {
    if(err) { return handleError(res, err); }
    return res.json(200, sequences);
  });
};

// Get a single sequence
exports.show = function(req, res) {
  Sequence.findById(req.params.id, function (err, sequence) {
    if(err) { return handleError(res, err); }
    if(!sequence) { return res.send(404); }
    return res.json(sequence);
  });
};

// Creates a new sequence in the DB.
exports.create = function(req, res) {
  req.body.owner = req.user._id;
  Sequence.create(req.body, function(err, sequence) {
    if(err) { return handleError(res, err); }
    return res.json(201, sequence);
  });
};

// Update the star field of the sequence
exports.toggle = function(req, res) {
  Sequence.findById(req.body._id, function (err, sequence) {
    if (err) { return handleError(res, err); }
    if(!sequence) { return res.send(404); }
    sequence.star = req.body.star;
    sequence.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, sequence);
    });
  });
};

// Updates an existing sequence in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Sequence.findById(req.params.id, function (err, sequence) {
    if (err) { return handleError(res, err); }
    if(!sequence) { return res.send(404); }
    var updated = _.merge(sequence, req.body, function(a,b){
      return _.isArray(a) ? b : undefined;
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, sequence);
    });
  });
};

// Deletes a sequence from the DB.
exports.destroy = function(req, res) {
  Sequence.findById(req.params.id, function (err, sequence) {
    if(err) { return handleError(res, err); }
    if(!sequence) { return res.send(404); }
    sequence.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.milk = function(req,res) {
  var name = req.params.id;
  if (!name)
    return handleError(res, 'No sequence identity specified!');

  console.log('Richiesta di esecuzione: '+name);
  return handleError(res, 'Service disabled!');


};

