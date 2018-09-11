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
        cb = cb || _.noop;
        if (!items || !item || !_.isArray(items)) {return;}
        const index = items.indexOf(item);
        if (index>-1) {
          items.splice(index, 1);
         cb();
        }
      }

      function depure(o) {
        if (_.isArray(o)) {
          o.forEach((io) => depure(io));
        } else if (_.isObject(o)) {
          delete o._id;
          delete o.$$hashKey;
        }
      }

      function _toString(o) {
        if (_.isNaN(o) || _.isUndefined(o) || _.isNull(o)) {return '';}
        if (_.isString(o)) {return o;}
        return  (_.isFunction(o.toString)) ? o.toString() : JSON.stringify(o);
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
          args.forEach((v, i) => {
            const rgx = new RegExp('\\{' + i + '\\}', 'g');
            msg = msg.replace(rgx, _toString(v));
          });
        } else if (args && _.isObject(args)) {
          o = args;
        }
        if (o && _.isObject(o)) {
          for(let pn in o) {
            const rgx = new RegExp('\\{'+pn+'\\}', 'g');
            msg = msg.replace(rgx, _toString(o[pn]));
          }
        }
        return msg;
      }

      function copyToClipboard(text) {
        if (!text) {return;}
        const $temp = $('<textarea>');
        $('body').append($temp);
        $temp.val(text).select();
        document.execCommand('copy');
        $temp.remove();
      }

      return {
        depure: depure,
        remove: remove,
        format: format,
        guid: guid,
        copyToClipboard: copyToClipboard
      }
    }]);


