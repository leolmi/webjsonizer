/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('SequenceItem', ['Keeper','NameValue',
    function(Keeper,NameValue) {

      function resolve(item) {
        item.data = _.map(item.data, function(i){
          return new NameValue(i);
        });
        item.headers = _.map(item.headers, function(i){
          return new NameValue(i);
        });
        item.keepers = _.map(item.keepers, function(k){
          return new Keeper(k);
        });
      }

      var SequenceItem = function (info) {
        this.title = 'New Item';
        this.method = 'get';
        this.referer = 'auto';
        if (info)
          _.extend(this, info);
        resolve(this);
      };
      SequenceItem.prototype = {
        title: '',
        skip: false,
        host: '',
        method: '',
        path: '',
        referer: '',  //se='auto' viene preso il precedente path
        data: [],
        datatype: '',
        headers: [],
        keepers: []
      };

      return (SequenceItem);
    }]);
