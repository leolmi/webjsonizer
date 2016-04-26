///**
// * Created by Leo on 29/05/2015.
// */
//'use strict';
//
//var u = require('./sequence.util');
//var _ = require('lodash');
//var https = require('https');
//var http = require('http');
//var querystring = require('querystring');
//
//
///**
// *
// * @param {[]} o
// * @param {boolean,function} [encode]
// * @returns {*}
// */
//function getObjectData(o, encode) {
//  if (typeof encode==='function') {
//    var eo = {}
//    for (var p in o)
//      eo[p] = encode(o[p]);
//    return querystring.stringify(eo);
//  } else if (encode) {
//    var eo = {}
//    for (var p in o)
//      eo[p] = u.encodeToEsa(o[p]);
//    return querystring.stringify(eo);
//  }
//  else {
//    return querystring.stringify(o);
//  }
//}
//
//function getData(data, encode) {
//  if (_.isString(data))
//    return data;
//  if (_.isObject(data))
//    return getObjectData(data, encode);
//  return undefined;
//}
//
//
//var getRedirectPath = function(pre, nxt) {
//  var pre_split = pre.split('/');
//  var nxt_split = nxt.split('/');
//
//  pre_split.pop();
//  nxt_split.forEach(function(e){
//    if (e=='..')
//      pre_split.pop();
//    else
//      pre_split.push(e);
//  });
//
//  return pre_split.join('/');
//};
//
//
///**
// * Richiesta
// * @param title
// * @param options
// * @param data
// * @param target
// * @param cb
// */
//var doRequest = function(title, options, data, target, cb) {
//  var skipped = false;
//  var download = false;
//  cb = cb || noop;
//  console.log('['+title+']-OPTIONS: ' + JSON.stringify(options));
//
//  var proto = options.https ? https : http;
//
//  var req = proto.request(options, function(res) {
//    var result = {
//      code:res.statusCode,
//      headers:res.headers
//    };
//    //console.log('['+title+']-RESULTS: ' + JSON.stringify(result));
//
//    var newpath = res.headers.location;
//    if (res.statusCode.toString()=='302' && newpath) {
//      skipped = true;
//      options.path = getRedirectPath(options.path ,newpath);
//      doHttpsRequest('redir - '+title, options, null, null, cb);
//    }
//
//    if (target) {
//      download = true;
//      res.setEncoding('binary');
//      res.pipe(target);
//      target.on('finish', function() {
//        console.log('Write file ended!');
//        target.close(cb(options,result, null));
//      });
//    }
//    else res.setEncoding('utf8');
//
//    var content = '';
//
//    res.on('data', function (chunk) {
//      //console.log('['+title+']-download data: '+chunk);
//      content+=chunk;
//    });
//    res.on('end', function () {
//      //console.log('['+title+']-Fine richiesta!   skipped='+skipped+'   download='+download+'  target='+(target ? 'si' : 'no'));
//      if (!skipped && !target && !download) {
//        options.headers = _.merge(options.headers, req.headers);
//        cb(options, result, content);
//      }
//    });
//  });
//
//  req.on('error', function(e) {
//    console.log('['+title+']-problem with request: ' + e.message);
//  });
//
//  if (data) {
//    console.log('['+title+']-send data: '+data);
//    req.write(data);
//  }
//
//  req.end();
//};
//exports.doRequest = doRequest;
//
///**
// * Valida la classe delle opzioni
// * @param options
// * @param usecookies
// */
//function check(options) {
//  if (!_.has(options, 'headers'))
//    options.headers = {};
//}
//
//function evalValidations(validations, content, params) {
//  if (!validations || validations.length<=0) return;
//  validations.forEach(function(v) {
//    var f = undefined;
//    if (typeof v.func == 'function')
//      f = v.func(content, params);
//    else if (v.js) {
//      f = new Function('content', 'params', v.js);
//    }
//    if (typeof f == 'function')
//      params[v.target] = f(content, params);
//  });
//}
//
///**
// * Effettua una catena di chiamate sequenziali
// * @param sequence
// * @param {Function} cb  //cb(err, content)
// * @param [options]
// * @param {Number} [i]
// */
//function evalSequence(sequence, cb, options, i) {
//  options = options || {headers: {}};
//  i = i || 0;
//
//  console.log('Eval sequence item n°'+i);
//
//  if (!sequence || !sequence.items || sequence.items.length <= 0)
//    cb(new Error('Sequence is empty or undefined!'));
//  if (sequence.items.length < i + 1)
//    cb(new Error('Wrong sequence!'));
//
//  check(options);
//
//  u.keep(options, sequence.items[i]);
//
//  evalValidations(sequence.items[i].prevalidations, sequence.items[i].data, sequence.parameters);
//
//  var data = getData(sequence.items[i].data);
//  options.headers['content-length'] = data ? data.length : 0;
//
//
//  doRequest(sequence.items[i].title, options, data, undefined, function (o, r, c) {
//    if (r.code != 200)
//      return cb(new Error('[' + sequence[i].title + '] - ended with code: ' + r.code));
//
//    if (_.has(r.headers, 'set-cookie'))
//      options.headers.cookie = r.headers['set-cookie'];
//
//    if (i >= sequence.length - 1)
//      return cb(null, c);
//
//    if (c)
//      evalValidations(sequence.items[i].postvalidations, c, sequence.parameters);
//
//    evalSequence(sequence, cb, options, i+1);
//  });
//}
//exports.evalSequence = evalSequence;
