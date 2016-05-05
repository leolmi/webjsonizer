/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('ParserOptions', [
    function() {

      var ParserOptions = function (info) {
        this.type = 'htmltable';
        this.pattern = '$(\'table\')';
        if (info)
          _.extend(this, info);
      };
      ParserOptions.prototype = {
        type: '',
        pattern: ''
      };

      return (ParserOptions);
    }]);
