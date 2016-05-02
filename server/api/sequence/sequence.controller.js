'use strict';

var _ = require('lodash');
var Sequence = require('./sequence.model');
var J = require('node-jsonizer');
//var J = require('../../jsonizer-dev/jsonizer');

function checkUser(req, res){
  var check = (req.user && req.user._id);
  if (!check) J.util.error(res, 'Undefined user!');
  return check;
}

function onSequence(id, cb) {
  if (!id)
    return cb(new Error('No sequence identity specified!'));
  Sequence.findById(id, function (err, sequence) {
    if (err) return cb(err);
    if (!sequence) return cb(new Error('Sequence not found!'));
    cb(null, sequence);
  });
}

function evalSequence(sequence, res, options) {
  J.eval(sequence, function (err, result) {
      if (err) return J.util.error(res, err);
      return J.util.ok(res, result);
    },
    sequence.parserOptions ,
    options);
}

function loadParameterValues(source, sequence) {
  if (!source) return;
  _.keys(source).forEach(function (k) {
    var p = _.find(sequence.parameters, function (p) {
      return p.name == k && !p.hidden;
    });
    if (p) p.value = source[k];
  });
}



// Get list of sequences
exports.index = function(req, res) {
  if (!checkUser(req, res)) return;
  Sequence.find({owner: req.user._id}, function (err, sequences) {
    if(err) { return J.util.error(res, err); }
    return J.util.ok(res, sequences);
  });
};

// Get a single sequence
exports.show = function(req, res) {
  onSequence(req.params.id, function(err, sequence){
    if(err) return J.util.error(res, err);
    return J.util.ok(res, sequence);
  });
};

// Creates a new sequence in the DB.
exports.create = function(req, res) {
  var template = req.body;
  template.owner = req.user._id;
  template.enabled = true;
  Sequence.create(template, function(err, sequence) {
    if(err) { return J.util.error(res, err); }
    return J.util.created(res, sequence);
  });
};

// Update the star field of the sequence
exports.toggle = function(req, res) {
  onSequence(req.body._id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    sequence.star = req.body.star;
    sequence.save(function (err) {
      if (err) { return J.util.error(res, err); }
      return J.util.ok(res, sequence);
    });
  });
};

// Updates an existing sequence in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    var updated = _.merge(sequence, req.body, function(a,b){
      return _.isArray(a) ? b : undefined;
    });
    updated.markModified('result');
    updated.markModified('parserOptions');
    updated.save(function (err) {
      if (err) { return J.util.error(res, err); }
      return J.util.ok(res, sequence);
    });
  });
};

// Deletes a sequence from the DB.
exports.destroy = function(req, res) {
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    sequence.remove(function(err) {
      if(err) { return J.util.error(res, err); }
      return J.util.deleted(res);
    });
  });
};


// Esegue la sequenza ricercandola per id
exports.milk = function(req, res) {
  var GET = req.method.toLowerCase() == 'get';
  onSequence(req.params.id, function (err, sequence) {
    if (err) return J.util.error(res, err);
    if (GET && !sequence.GET)
      return J.util.error(res, new Error('Sequence not available!'));
    var options = {verbose: true};
    var source = GET ? req.params : req.body;
    loadParameterValues(source, sequence);
    evalSequence(sequence, res, options);
  });
};

// Esegue la sequenza passata
exports.play = function(req,res) {
  var sequence = req.body;
  if (!sequence) return J.util.error(res, 'No sequence specified!');
  var options = {
    verbose: true,
    parameters: {}
  };
  sequence.parameters.forEach(function(p){
    options.parameters[p.name] = p.value;
  });
  evalSequence(sequence, res, options);
};

exports.parse = function(req, res) {
  var options = req.body;
  if (!options || !options.parserOptions || !options.data)
    return J.util.error(res, 'Not available data passed!');

  J.parser.parse(options.data, options.parserOptions, function (err, json) {
    if (err)
      return J.util.error(res, 'Error on parsing data:' + err.message);
    if (!json)
      return J.util.error(res, 'No data');
    return J.util.ok(res, json);
  });
};

exports.schema = function(req, res) {
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    var schema = {};
    sequence.parameters.forEach(function(p){
      if (!p.hidden) {
        schema[p.name] = '';
      }
    });
    return J.util.ok(res, schema);
  });
};
