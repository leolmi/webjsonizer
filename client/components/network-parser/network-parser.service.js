/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('networkParser', ['URL',
    function(URL) {
      var _options = {
        allexclusion: ['jpg', 'gif', 'png', 'js', 'css', 'ads', 'jsp', 'php', 'ico', 'json'],
        exclusion: ['jpg', 'gif', 'png', 'js', 'css', 'ads', 'jsp', 'ico', 'json'],
        allMimeTypes: ['*', 'text/', 'text/plain', 'text/html', 'text/richtext', 'text/x-component'],
        includeMimeTypes: ['text/']
      };

      function validate(exlist, url, mimetype) {
        if (!url) return false;
        var result = _.find(exlist, function (ext) {
          return url.indexOf('.' + ext + '?') > 0 || url.indexOf('.' + ext) == url.length - ext.length - 1;
        });
        if (result) return false;
        if (!mimetype || _options.includeMimeTypes.indexOf('*') > -1 || !_options.includeMimeTypes.length) return true;
        result = _.find(_options.includeMimeTypes, function (mt) {
          return mimetype.indexOf(mt) > -1;
        });
        return result ? true : false;
      }


      function parsePostman(jsondata, cb) {
        var items = [];
        try {
          var step = 1;
          var prev = '';
          jsondata.order.forEach(function (id) {
            var req = _.find(jsondata.requests, function (r) {
              return r.id == id;
            });
            if (req) {
              var U = new URL(req.url);
              var item = {
                title: 'step ' + step++,
                method: req.method,
                path: U.pathsearchname,
                host: U.hostname,
                referer: prev
              };
              if (req.headers) {
                item.headers = [];
                req.headers.split('\n').forEach(function(h){
                  var pos = h.indexOf(':');
                  if (pos>0) {
                    item.headers.push({
                      value: h.substr(pos+1).trim(),
                      name: h.substr(0, pos).trim()
                    });
                  }
                });
              }
              if (req.data) {
                switch (req.dataMode) {
                  case 'params':
                    // TODO: ......
                    console.log('Params from Postman not yet implemented')
                    break;
                  case 'urlencoded':
                    if (_.isArray(req.data)) {
                      item.data = _.map(req.data, function(d){
                        return {name: d.key, value: d.value};
                      });
                    }
                    break;
                }
              }
              items.push(item);
              prev = req.url;
            }
          });
          cb(null, items);
        } catch (err) {
          cb(err);
        }
      }

      function parseHar(jsondata, cb) {
        var items = [];
        try {
          var step = 1;
          var prev = '';
          var justheaders = [];
          if (jsondata.log && jsondata.log.entries && jsondata.log.entries.length > 0) {
            jsondata.log.entries.forEach(function (e) {
              var mimeType = (e.response && e.response.content) ? e.response.content.mimeType : null;
              var url = e.request ? e.request.url : null;
              if (validate(_options.exclusion, url, mimeType)) {
                var U = new URL(e.request.url);
                var item = {
                  title: 'step ' + step++,
                  method: e.request.method,
                  path: U.pathsearchname,
                  host: U.hostname,
                  referer: prev
                };
                if (e.request.postData) {
                  item.datatype = e.request.postData.mimeType;
                  item.data = [];
                  e.request.postData.params.forEach(function (p) {
                    item.data.push(p);
                  });
                }
                if (e.request.headers) {
                  item.headers = [];
                  e.request.headers.forEach(function (h) {
                    //TODO : da migliorare, dovrebbe cercare l'ultimo header con tale nome.
                    if (!_.find(justheaders, function (xh) {
                        return xh.name == h.name && xh.value == h.value;
                      })) {
                      item.headers.push(h);
                      justheaders.push(h);
                    }
                  });
                }
                items.push(item);
                prev = e.request.url;
              }
            });
          }
          cb(null, items);
        } catch (err) {
          cb(err);
        }
      }

      function parseJson(jsn, cb) {
        try {
          var jsondata = JSON.parse(jsn);
          if (jsondata && jsondata.log && jsondata.log.creator && jsondata.creator.name && jsondata.creator.name.toLowerCase()=='webinspector') {
            parseHar(jsondata, cb);
          } else if (jsondata && jsondata.order && _.isArray(jsondata.order) && jsondata.requests && _.isArray(jsondata.requests)) {
            parsePostman(jsondata, cb);
          } else {
            cb(new Error('json content not recognized!'));
          }
        } catch (err) {
          cb(err);
        }
      }

      function parseIEXml($xml, cb) {
        //TODO: ie xml parser
        cb(new Error('IE Network data xml parser is not yet available!'));
      }

      function parseXml(xml, cb) {
        if (!$ || !$.parseXML || !_.isFunction($.parseXML)) {
          cb(new Error());
        } else {
          var xmlDoc = $.loadXML(xml);
          var $xml = $(xmlDoc);
          if ($xml('log > creator > name').text().toLowerCase().indexOf('internet explorer')>-1) {
            parseIEXml($xml, cb);
          } else {
            cb(new Error('xml content not recognized!'));
          }
        }
      }

      function parse(content, cb) {
        if (content)
          content = content.trim();

        if (content && content.indexOf('{') == 0) {
          parseJson(content, cb);
        } else if (content && content.indexOf('<?xml ') == 0) {
          parseXml(content, cb);
        } else {
          cb(new Error('Invalid file content!'));
        }
      }

      return {
        options: _options,
        parse: parse
      }
    }]);
