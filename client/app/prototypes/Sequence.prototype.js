/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('Sequence', ['ParserOptions','Parameter','SequenceItem','Keeper',
    function(ParserOptions,Parameter,SequenceItem,Keeper) {

      function resolve(sequence) {
        sequence.parameters = _.map(sequence.parameters, function(p){
          return new Parameter(p);
        });
        sequence.items = _.map(sequence.items, function(i){
          return new SequenceItem(i);
        });
        sequence.keepers = _.map(sequence.keepers, function(k){
          return new Keeper(k);
        });
        sequence.parserOptions = new ParserOptions(sequence.parserOptions);
      }

      var Sequence = function (info) {
        this.title = 'New Sequence';
        if (info)
          _.extend(this, info);
        resolve(this);
      };
      Sequence.prototype = {
        title: '',
        SSL: false,
        star: false,
        enabled: true,
        result: '',
        parameters: [],
        items: [],
        keepers: [],
        parserOptions: {}
      };

      return (Sequence);
    }]);
