'use strict';

var _ = require('lodash');
var Sequence = require('./sequence.model');
var J = require('node-jsonizer');
//var J = require('../../jsonizer/jsonizer.js');

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

function evalSequence(sequence, res) {
  J.eval(sequence, function (err, result) {
      if (err) return J.util.error(res, err);
      return J.util.ok(res, result);
    }, {
      type: 'htmltable',
      pattern: sequence.selector
    }, {
      verbose: false
    });
}

// Esegue la sequenza restituendo i risultati
exports.milk = function(req, res) {
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    evalSequence(sequence, res);
  });
};


exports.play = function(req,res) {
  var sequence = req.body;
  if (!sequence) return J.util.error(res, 'No sequence specified!');
  evalSequence(sequence, res);
};

exports.parse = function(req, res) {
  var data = req.body;
  //console.log('[PARSER] - dati ricevuti:'+JSON.stringify(data));
  if (!data || !data.pattern || !data.html)
    return J.util.error(res, 'Not available data passed!');

  J.parser.parseHtmlTable(data.html, data.pattern, function(err, json){
    if (err)
      return J.util.error(res, 'Error on parsing data:'+err.message);
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
