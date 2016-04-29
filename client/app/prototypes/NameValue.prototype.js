/* Created by Leo on 29/04/2016. */
'use strict';


angular.module('webjsonizerApp')
  .factory('NameValue', ['util',
    function(util) {

      var NameValue = function (info) {
        this.id = util.guid();
        if (info)
          _.extend(this, info);
      };
      NameValue.prototype = {
        id: '',
        name: '',
        value: '',
        hidden: false
      };

      return (NameValue);
    }]);
