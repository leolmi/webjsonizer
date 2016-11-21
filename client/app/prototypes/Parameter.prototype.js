/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('Parameter', ['util',
    function(util) {

      var Parameter = function (info) {
        this.id = util.guid();
        this.name = '';
        this.value = '';
        this.default = '';
        this.type = '';
        this.hidden = false;
        if (info)
          _.extend(this, info);
      };
      Parameter.prototype = {
        id: '',
        name: '',
        default: '',
        value: '',
        type: '',
        hidden: false
      };

      return (Parameter);
    }]);
