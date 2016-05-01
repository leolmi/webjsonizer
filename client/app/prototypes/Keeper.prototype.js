/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('Keeper', ['util',
    function(util) {

      var Keeper = function (info) {
        this.id = util.guid();
        if (info)
          _.extend(this, info);
      };
      Keeper.prototype = {
        id: '',
        target: '',
        sourceType: '',
        name: '',
        logicType: '',
        logic: ''
      };

      return (Keeper);
    }]);
