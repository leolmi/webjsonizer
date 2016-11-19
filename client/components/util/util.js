/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('util', [
    function() {

      /**
       * Generate new GUID
       * @returns {string}
       */
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

      function remove(items, item, cb) {
        if (!items || !item || !_.isArray(items)) return;
        var index = items.indexOf(item);
        if (index>-1) {
          items.splice(index, 1);
          if (cb) cb();
        }
      }

      function depure(o) {
        if (_.isArray(o)) {
          o.forEach(function(io){
            depure(io);
          });
        } else if (_.isObject(o)) {
          delete o._id;
          delete o.$$hashKey;
        }
      }

      function _toString(o) {
        if (_.isNaN(o) || _.isUndefined(o) || _.isNull(o)) return '';
        if (_.isString(o)) return o;
        if (_.isFunction(o.toString))
          return o.toString();
        return JSON.stringify(o);
      }

      /**
       * Costruisce un messaggio effettuando la replace con i dati
       * in args (per indice) o i valori in o (object)
       * @param {string} msg
       * @param {array|object} args
       * @param {object} [o]
       * @returns {*}
       */
      function format(msg, args, o) {
        if (args && _.isArray(args)) {
          args.forEach(function (v, i) {
            var rgx = new RegExp('\\{' + i + '\\}', 'g');
            msg = msg.replace(rgx, _toString(v));
          });
        }
        else if (args && _.isObject(args)) {
          o = args;
        }
        if (o && _.isObject(o)) {
          for(var pn in o) {
            var rgx = new RegExp('\\{'+pn+'\\}', 'g');
            msg = msg.replace(rgx, _toString(o[pn]));
          }
        }
        return msg;
      }

      return {
        depure: depure,
        remove: remove,
        format: format,
        guid: guid
      }
    }]);


