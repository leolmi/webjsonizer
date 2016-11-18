'use strict';

var _ = require('lodash');
var Sequence = require('./sequence.model');
var Release = require('../deploy/release.controller');
//var J = require('node-jsonizer');
var J = require('../../jsonizer-dev/jsonizer');


function checkUser(req, res){
  var check = (req.user && req.user._id);
  if (!check) J.util.error(res, 'Undefined user!');
  return check;
}

// mode:
//  - sequence: solo sequenze (default)
//  - all: sequenze e releases
//  - release: solo releases
function onSequence(id, cb, mode) {
  if (!id)
    return cb(new Error('No sequence identity specified!'));

  mode = mode || 'sequence';
  var release = Release.isRelease(id);

  function handler(err, element) {
    if (err) return cb(err);
    if (!element) return cb(new Error('Not found!'));
    cb(null, element, release);
  }

  if (release) {
    if (mode=='all' || mode=='release') {
      Release.show(id, handler);
    } else {
      cb();
    }
  } else {
    Sequence.findById(id, handler);
  }
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
  if (_.isArray(source)) {
    source.forEach(function (sp) {
      var p = _.find(sequence.parameters, function (p) {
        return (p.name || p.key) == sp.name && !p.hidden;
      });
      if (p) p.value = sp.value;
    });
  }
  else if (_.isObject(source)) {
    _.keys(source).forEach(function (k) {
      var p = _.find(sequence.parameters, function (p) {
        return p.name == k && !p.hidden;
      });
      if (p) p.value = source[k];
    });
  }
}



// Get list of sequences
exports.index = function(req, res) {
  if (!checkUser(req, res)) return;
  Sequence.find({owner: req.user._id}, '-vote -owner -result', function (err, sequences) {
    if(err) { return J.util.error(res, err); }
    return J.util.ok(res, sequences);
  });
};

// Get a single sequence
exports.show = function(req, res) {
  onSequence(req.params.id, function(err, sequence){
    if(err) return J.util.error(res, err);
    return J.util.ok(res, sequence);
  }, 'all');
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
  delete req.body.version;
  delete req.body.vote;
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
  onSequence(req.params.id, function(err, element) {
    if (err) return J.util.error(res, err);
    element.remove(function(err) {
      if(err) { return J.util.error(res, err); }
      return J.util.deleted(res);
    });
  }, 'all');
};


// Esegue la sequenza ricercandola per id
exports.milk = function(req, res) {
  var GET = req.method.toLowerCase() == 'get';
  onSequence(req.params.id, function (err, element, release) {
    if (err) return J.util.error(res, err);
    var sequence = release ? element.sequence : element;
    if (GET && !sequence.GET)
      return J.util.error(res, new Error('Sequence not available!'));
    var options = {verbose: false};
    var source = GET ? req.params : req.body;
    loadParameterValues(source, sequence);
    evalSequence(sequence, res, options);
  }, 'all');
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
  onSequence(req.params.id, function(err, element, release) {
    if (err) return J.util.error(res, err);
    var sequence = release ? element.sequence : element;
    var schema = {
      title: sequence.title,
      desc: sequence.desc,
      parameters: _(sequence.parameters)
        .filter(function(p){
          return !p.hidden;
        })
        .map(function(p){
          return {name: p.name, value:''};
        })
        .value()
    };
    return J.util.ok(res, schema);
  }, 'all');
};

exports.search = function(req, res) {
  if (!req.body.text || !req.body.text.trim())
    return J.util.ok(res, []);
  Release.index(req.body.text, function(err, releases) {
    if (err) return J.util.error(res, err);
    if (!releases || releases.length<=0)
      return J.util.ok(res, []);
    return J.util.ok(res, releases);
  });
};

// Pubblica una sequenza
exports.publish = function(req, res) {
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    Release.publish(sequence, function(err, seq){
      if (err) return J.util.error(res, err);
      return J.util.ok(res, seq);
    });
  });
};

// Enumera le pubblicazioni di una sequenza
exports.releases = function(req, res) {
  onSequence(req.params.id, function(err, sequence) {
    if (err) return J.util.error(res, err);
    Release.releases(sequence._id, function(err, releases) {
      if (err) return J.util.error(res, err);
      return J.util.ok(res, releases);
    });
  });
};
