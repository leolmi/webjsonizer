/* Created by Leo on 29/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('sequenceKeeper', ['$rootScope',
    function ($rootScope) {
      return {
        restrict: 'E',
        scope: {keeper: '=ngModel', item:'=', sequence:'=', index: '='},
        templateUrl: 'app/editor/sequence-keeper.html',
        link: function (scope, ele, atr) {
          scope.removeKeeper = function() {
            $rootScope.$broadcast('REMOVE-SEQUENCE-ITEM-KEEPER', {keeper:scope.keeper, item:scope.item});
          };

          scope.changed = function() {
            if (atr['ngChange'])
              ele.scope().$eval(atr['ngChange']);
          };

          scope.sources = [
            {name: '', desc: '-none-'},
            {name: 'body', desc: 'Body'},
            {name: 'cookies', desc: 'Cookies'},
            {name: 'headers', desc: 'Headers'}];

          scope.logicTypes = [
            {name: '', desc: 'no logic' },
            {name: 'regex', desc: 'Regex'},
            {name: 'javascript', desc: 'JavaScript'}];

          scope.changeLogicType = function() {
            if (!scope.keeper.logicType)
              scope.keeper.logic = '';
            scope.changed();
          };
        }
      }
    }]);
