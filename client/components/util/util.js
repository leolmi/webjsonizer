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

      return {
        depure: depure,
        remove: remove,
        guid: guid
      }
    }]);


