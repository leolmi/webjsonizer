'use strict';

var _ = require('lodash');
var Sequence = require('./sequence.model');
//var J = require('jsonizer');  //<-- quando sarà in node_modules
var J = require('../../jsonizer/jsonizer.js');

function checkUser(req, res){
  var check = (req.user && req.user._id);
  if (!check) J.util.error(res, 'Undefined user!');
  return check;
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
  Sequence.findById(req.params.id, function (err, sequence) {
    if(err) { return J.util.error(res, err); }
    if(!sequence) { return J.util.notfound(res); }
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
  Sequence.findById(req.body._id, function (err, sequence) {
    if (err) { return J.util.error(res, err); }
    if(!sequence) { return J.util.notfound(res); }
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
  Sequence.findById(req.params.id, function (err, sequence) {
    if (err) { return J.util.error(res, err); }
    if(!sequence) { return J.util.notfound(res); }
    var updated = _.merge(sequence, req.body, function(a,b){
      return _.isArray(a) ? b : undefined;
    });
    updated.save(function (err) {
      if (err) { return J.util.error(res, err); }
      return J.util.ok(res, sequence);
    });
  });
};

// Deletes a sequence from the DB.
exports.destroy = function(req, res) {
  Sequence.findById(req.params.id, function (err, sequence) {
    if(err) { return J.util.error(res, err); }
    if(!sequence) { return J.util.notfound(res); }
    sequence.remove(function(err) {
      if(err) { return J.util.error(res, err); }
      return J.util.deleted(res);
    });
  });
};

function evalSequence(sequence, res) {
  J.eval(sequence, function(err, table){
    if (err) return J.util.error(res, err);
    return J.util.ok(res, table);
  }, {type:'htmltable', pattern:sequence.selector});
}

// Esegue la sequenza restituendo i risultati
exports.milk = function(req,res) {
  var id = req.params.id;
  if (!id)
    return J.util.error(res, 'No sequence identity specified!');

  Sequence.findById(id, function (err, sequence) {
    if (err) return J.util.error(res, err);
    if (!sequence) return J.util.notfound(res);
    evalSequence(sequence, res);
  });
};




var https = require('https');
var querystring = require('querystring');
function test(cb) {
  cb = cb || noop;
  var data = undefined;
  var title = 'www.random.org';

  https.get('https://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new', function(res) {
    var result = {
      code:res.statusCode,
      headers:res.headers
    };
    console.log('TEST ['+title+']-RESULTS: ' + JSON.stringify(result));
    var content = '';
    res.on('data', function (chunk) {
      console.log('TEST ['+title+']-download data: '+chunk);
      content+=chunk;
    });
    res.on('end', function () {
      cb(null, content);
    });

  }).on('error', function(e) {
    cb(e);
  });


  //var req = https.request({
  //  method: 'GET',
  //  host: 'www.random.org',
  //  path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new',
  //  headers: {
  //    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  //    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
  //  }
  //},function(res){
  //  var result = {
  //    code:res.statusCode,
  //    headers:res.headers
  //  };
  //  console.log('TEST ['+title+']-RESULTS: ' + JSON.stringify(result));
  //
  //  var content = '';
  //
  //  res.on('data', function (chunk) {
  //    console.log('TEST ['+title+']-download data: '+chunk);
  //    content+=chunk;
  //  });
  //
  //  res.on('end', function () {
  //    cb(null, content);
  //  });
  //});
  //
  //req.setTimeout(10000);
  //
  //req.on('error', function(e) {
  //  console.log('TEST ['+title+']-problem with request: ' + e.message);
  //  cb(e);
  //});
  //
  //if (data) {
  //  console.log('TEST ['+title+']-send data: '+data);
  //  req.write(data);
  //}
  //
  //req.end();

}



exports.play = function(req,res) {
  console.log('PLAY');
  var sequence = req.body;
  console.log('Sequenza: '+JSON.stringify(sequence));
  if (!sequence) return J.util.error(res, 'No sequence specified!');

  //test(function(err,c){
  //  if (err) return J.util.error(res, err);
  //  return J.util.ok(res, c);
  //});
  evalSequence(sequence, res);
};

exports.parse = function(req, res) {
  var data = req.body;
  console.log('dati ricevuti:'+JSON.stringify(data));
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
