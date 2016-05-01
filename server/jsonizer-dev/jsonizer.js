/*
 * jsonizer
 * Copyright 2015
 * Authors: Leo Olmi.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Project: https://github.com/leolmi/node-jsonizer
 */

var _ = require('lodash'),
  u = require('./lib/utils'),
  parser = require('./lib/parser'),
  https = require('https'),
  http = require('http'),
  querystring = require('querystring'),
  zlib = require("zlib");


'use strict';
var jsonizer = function() {
  function noop(){}

  var opt_prototype = {
    headers: {}
  };

  var _keepers = [
    { name:'__VIEWSTATE', pattern:'<input.*?name="__VIEWSTATE".*?value="(.*?)".*?>'},
    { name:'__VIEWSTATEGENERATOR', pattern:'<input.*?name="__VIEWSTATEGENERATOR".*?value="(.*?)".*?>' },
    { name:'__EVENTVALIDATION', pattern:'<input.*?name="__EVENTVALIDATION".*?value="(.*?)".*?>' }
  ];

  var ResultData = function() {};
  ResultData.prototype = {
    type: 'none',
    data: null,
    content: ''
  };

  /**
   *
   * @param {[]} o
   * @param {boolean,function} [encode]
   * @returns {*}
   */
  function getObjectData(o, encode) {
    var eo = {};
    if (typeof encode==='function') {
      for (var p in o)
        eo[p] = encode(o[p]);
      return querystring.stringify(eo);
    } else if (encode) {
      for (var p in o)
        eo[p] = u.encodeToEsa(o[p]);
      return querystring.stringify(eo);
    }
    else {
      return querystring.stringify(o);
    }
  }

  function getArrayData(a, encode) {
    if (!a || !a.length) return undefined;
    var eo = {};
    if (typeof encode==='function') {
      a.forEach(function(i){ eo[i.name] = encode(i.value); });
    } else if (encode) {
      a.forEach(function(i){ eo[i.name] = u.encodeToEsa(i.value); });
    } else {
      a.forEach(function(i){ eo[i.name] = i.value; });
    }
    return querystring.stringify(eo);
  }

  function getData(data, encode) {
    if (data) {
      if (_.isString(data))
        return data;
      if (_.isArray(data)) {
        if (data.length <= 0)
          return undefined;
        return getArrayData(data, encode);
      }
      if (_.isObject(data))
        return getObjectData(data, encode);
    }
    return undefined;
  }


  function getRedirectPath(opt, nxt) {
    if (nxt.indexOf(opt.host)<0)
      return opt.host + nxt;
    return nxt;
  }

  function checkCookies(res, o) {

    if (_.has(res.headers, 'set-cookie'))
      o.headers.cookie = res.headers['set-cookie'];
  }

  /**
   * Richiesta
   * @param title
   * @param options
   * @param data
   * @param target
   * @param cb
   */
  function doRequest(title, options, data, target, cb) {
    var skipped = false;
    var download = false;
    cb = cb || noop;
    if (options.verbose) console.log('['+title+']-OPTIONS: ' + JSON.stringify(options, null, 2));
    options.agent = false;
    var proto = options.https ? https : http;
    var protocol = options.https ? 'https://' : 'http://';

    var req_opt = {
      path: protocol + options.host + options.path,
      method: options.method,
      headers: options.headers,
      host: options.host
    };

    if (process.env.PROXY_HOST) {
      req_opt.host = process.env.PROXY_HOST;
      req_opt.port = process.env.PROXY_PORT;
    }

    if (options.verbose) console.log('['+title+']-REQ OPT: ' + JSON.stringify(req_opt, null, 2));

    var req = proto.request(req_opt, function(res) {
      var result = {
        code:res.statusCode,
        headers:res.headers
      };
      if (options.verbose) console.log('['+title+']-RESULTS: ' + JSON.stringify(result, null, 2));


      var newpath = res.headers.location;
      if ((res.statusCode.toString()=='302' || res.statusCode.toString()=='301') && newpath) {
        skipped = true;
        if (options.verbose) console.log('new location:'+newpath);
        var path = getRedirectPath(options ,newpath);
        if (path==options.path){
          console.log('Location is the same!');
          return;
        }
        options.path = path;
        if (options.verbose) console.log('Redir new path:'+options.path);
        checkCookies(res, options);

        doRequest('redir - '+title, options, null, null, cb);
      }

      if (target) {
        download = true;
        res.setEncoding('binary');
        res.pipe(target);
        target.on('finish', function() {
          if (options.verbose) console.log('Write file ended!');
          target.close(cb(null, options,result));
        });
      }

      var chunks = [];
      var content = '';

      res.on('data', function (chunk) {
        var type = _.isString(chunk) ? 'stringa' : 'altro';
        if (options.verbose) console.log('[' + title + ']-download data (' + type + '): ' + chunk);
        content += chunk;
        chunks.push(chunk);
      });

      res.on('end', function () {
        if (options.verbose) console.log('['+title+']-Fine richiesta!   skipped='+skipped+'   download='+download+'  target='+(target ? 'si' : 'no'));
        if (!skipped && !target && !download) {
          options.headers = _.merge(options.headers, req.headers);
          var buffer = Buffer.concat(chunks);

          var encoding = res.headers['content-encoding'];
          if (encoding == 'gzip') {
            zlib.gunzip(buffer, function(err, decoded) {
              cb(err, options, result, decoded && decoded.toString());
            });
          } else if (encoding == 'deflate') {
            zlib.inflate(buffer, function(err, decoded) {
              cb(err, options, result, decoded && decoded.toString());
            })
          } else {
            cb(null, options, result, buffer.toString());
          }
        }
      });
    });

    req.on('error', function(e) {
      if (options.verbose) console.log('['+title+']-problem with request: ' + JSON.stringify(e));
      cb(e);
    });

    if (data) {
      if (options.verbose) console.log('['+title+']-send data: '+data);
      req.write(data);
    }

    req.end();
  }

  /**
   * Valida la classe delle opzioni
   * @param options
   */
  function check(options) {
    if (!_.has(options, 'headers'))
      options.headers = {};
  }

  function getUrl(o, item) {
    return o.host + item.path;
  }

  function checkHost(url){
    url = url.replace('http://','');
    url = url.replace('https://','');
    return url;
  }

  /**
   * Preleva i valori degli headers e del referer
   * @param o
   * @param item
   * @param sequence
   * @param index
   */
  function keep(o, item, sequence, index) {
    item.headers.forEach(function (h) {
      o.headers[h.name.toLowerCase()] = h.value;
    });
    u.keep(o, item, ['method', 'path'], true);
    if (item.host) o.host = checkHost(item.host);

    //item precedente
    var preitem = (index > 0) ? sequence.items[index - 1] : null;

    if (item.referer) {
      if (item.referer.toLowerCase() == 'auto') {
        if (preitem)
          o.headers.referer = getUrl(o, preitem);
      }
      else o.headers.referer = item.referer;
    }
  }

  /**
   * verifica gli headers
   * @param options
   * @param item
   * @param data
   */
  function validateHeaders(options, item, data) {
    if (data && data.length)
      options.headers['content-length'] = data.length;
    else
      delete options.headers['content-length'];

    if (!_.has(options.headers, 'host'))
      options.headers['host'] = options.host;
  }

  function getItem(sequence, options, index, cb) {
    if (sequence && sequence.items && sequence.items.length > index) {
      while (sequence.items.length > index && sequence.items[index].skip) {
        if (options.verbose) console.log('['+sequence.items[index].title+']- n°'+index+1+' SKIPPED');
        index++;
      }
      if (sequence.items.length <= index)
        return cb(new Error('Wrong sequence!'));
      cb(null, sequence.items[index], index);
    } else {
      cb(new Error('No available items!'));
    }
  }

  function isLast(sequence, index) {
    while (sequence.items.length > index && sequence.items[index].skip) {
      index = index + 1;
    }
    return sequence.items.length >= index;
  }

  /**
   * Scrive i valori dei parametri nei replacers
   * @param sequence
   * @param options
   * @param data
   */
  function replaceData(sequence, options, data) {
    var seq_prop = ['host','path'];
    sequence.parameters.forEach(function(p){
      var rgx = new RegExp('\\['+ p.name+'\\]', 'gmi');
      //properties
      seq_prop.forEach(function(pn){
        options[pn] = options[pn].replace(rgx, p.value);
      });
      //data
      if (data)
        data = data.replace(rgx, p.value);
      //headers
      _.keys(options.headers, function(h) {
        options.headers[h] = options.headers[h].replace(rgx, p.value);
      });
    });
    return data;
  }

  function isValid(r) {
    return r != null && r != undefined;
  }

  function evalKeeperLogic(keeper, arg) {
    if (!keeper.logic)
      return arg;
    switch(keeper.logicType) {
      case 'regex':
        var rgx = new RegExp(keeper.logic);
        return rgx.exec(arg);
      case 'javascript':
        var f = new Function('data', '_', keeper.logic);
        return f(arg, _);
      default:
        return arg;
    }
  }

  function getCookie(cookie, name) {
    if (cookie) {
      var cookies = cookie.split(';');
      var pos = 0;
      cookie = _.find(cookies, function (c) {
        pos = c.indexOf(name + '=');
        return pos > -1;
      });
      if (cookie)
        return cookie.substr(pos + 1);
    }
  }

  /**
   * Esegue il singolo estrattore
   * @param sequence
   * @param options
   * @param content
   */
  function evalKeeper(sequence, keeper, options, content) {
    var target = _.find(sequence.parameters, function(p){
      return p.id == keeper.target;
    });
    if (!target) return;
    var value = null;
    switch(keeper.sourceType) {
      case 'body':
        value = evalKeeperLogic(keeper, content);
        break;
      case 'cookies':
        var cookie = options.headers['cookie'] || options.headers['Cookie'];
        if (cookie) {
          if (keeper.name)
            cookie = getCookie(cookie, name);
          value = evalKeeperLogic(keeper, cookie);
        }
        break;
      case 'headers':
        if (keeper.name) {
          var header = options.headers[name];
          if (header)
            value = evalKeeperLogic(keeper, options.headers[k]);
        } else {
          value = _.find(_.keys(options.headers), function (k) {
            return isValid(evalKeeperLogic(keeper, options.headers[k]));
          });
        }
        break;
    }
    if (value)
      target.value = value;
  }

  /**
   * Esegue gli estrattori a livello di item
   * @param item
   * @param content
   * @param options
   */
  function evalKeepers(sequence, item, options, content) {
    if (item.keepers.length) {
      item.keepers.forEach(function(k){
        evalKeeper(sequence, k, options, content);
      });
    }
  }

  /**
   * Effettua una catena di chiamate sequenziali
   * @param sequence
   * @param {function} cb  //cb(err, content)
   * @param {object} [parseroptions]
   * @param {object} [options]
   * @param {number} [i]
   */
  function evalSequence(sequence, cb, parseroptions, options, i) {
    options = options || {};
    options = _.merge(options, opt_prototype);
    i = i || 0;

    console.log('OPTIONS: '+JSON.stringify(options));
    getItem(sequence, options, i, function(err, item, index){
      if (err) return cb(err);

      options.https = sequence.SSL;
      if (options.verbose) console.log('['+item.title+']-OPTIONS: (before check): ' + JSON.stringify(options));
      check(options);
      if (options.verbose) console.log('['+item.title+']-OPTIONS: (after check & before keep)' + JSON.stringify(options));
      keep(options, item, sequence, index);
      if (options.verbose) console.log('['+item.title+']-OPTIONS: (after keep)' + JSON.stringify(options));

      var data = getData(item.data);
      validateHeaders(options, item, data);
      data = replaceData(sequence, options, data);

      if (options.verbose) console.log('['+item.title+']-REQUEST BODY: '+data);
      doRequest(item.title, options, data, undefined, function (err, o, r, c) {
        if (err)
          return cb(err);

        if (options.verbose) console.log('['+(index+1)+' '+item.title+'] - RICHIESTA EFFETTUATA CON SUCCESSO, CONTENT: '+c);

        //checkCookies(r, options);

        if (isLast(sequence, index)) {
          parser.parse(c, parseroptions, function(err, data) {
            if (err) return cb(err);
            var result = new ResultData();
            result.type = parseroptions.type;
            result.data = data;
            result.content = c;
            return cb(err, result);
          });
        }
        else {
          evalKeepers(sequence, item, options, c);
          evalSequence(sequence, cb, parseroptions, options, index + 1);
        }
      });
    });
  }


  /**
   * Effettua una catena di chiamate sequenziali
   * @param sequence                  // sequenza chiamate
   * @param {Function} cb             // cb(err, content)
   * @param {Object} [parseroptions]  // opzioni per il parser html
   * @param {Object} [options]        // opzioni chiamata web
   */
  function evalSequenceStart(sequence, cb, parseroptions, options) {
    return evalSequence(sequence, cb, parseroptions, options, 0);
  }

  return  {
    util: {
      ok: function(res, obj) {return res.json(200, obj);},
      created: function(res, obj) {return res.json(201, obj);},
      deleted: function(res) {return res.json(204);},
      notfound: function(res) {return res.send(404); },
      error: function(res, err) { return res.send(500, err); },
      getkeeper: function(name) { return _.find(_keepers, {'name':name}); }
    },
    parser: {
      types: parser.types,
      parse: parser.parse,
      parseHtmlTable: parser.parseHtmlTable,
      parseJsonContent: parser.parseJsonContent,
      parseCustomContent: parser.parseCustomContent
    },
    eval: evalSequenceStart
  };
}.call(this);

exports = module.exports = jsonizer;
