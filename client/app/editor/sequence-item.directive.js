/**
 * Created by Leo on 22/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .directive('sequenceItem', ['$rootScope','Keeper',
    function ($rootScope,Keeper) {
      return {
        restrict: 'E',
        scope: {item: '=ngModel', sequence: '=', last: '=', index: '=', collapsed: '='},
        templateUrl: 'app/editor/sequence-item.html',
        link: function (scope, ele, atr) {
          function removeItem() {
            $rootScope.$broadcast('REMOVE-SEQUENCE-ITEM', {item:scope.item});
          }
          scope.buttons = [{
            icon: 'fa-remove',
            action: function () {
              removeItem();
            }
          }];

          scope.addnew = function () {
            $rootScope.$broadcast('NEW-SEQUENCE-ITEM-REQUEST', {index: scope.index});
          };


          scope.toggle = function () {
            scope.collapsed = !scope.collapsed;
          };

          scope.getShortDesc = function () {
            var path = scope.item.path || '<undefined>';
            return scope.item.method + ' - ' + path;
          };

          scope.$on('open-item', function (e, args) {
            if (args.item == scope.item)
              scope.collapsed = false;
          });

          scope.properties = [{
            title: 'Host',
            name: 'host',
            placeholder: 'auto'
          }, {
            title: 'Method',
            name: 'method',
            placeholder: 'GET'
          }, {
            title: 'Path',
            name: 'path'
          }, {
            title: 'Referer',
            name: 'referer'
          }];

          scope.changed = function () {
            if (atr['ngChange'])
              ele.scope().$eval(atr['ngChange']);
          };

          scope.addHeader = function () {
            scope.item.headers.push({name: '', value: '', hidden: false});
            scope.changed();
          };
          scope.removeHeader = function (index) {
            scope.item.headers.splice(index, 1);
            scope.changed();
          };

          scope.addDataItem = function () {
            scope.item.data.push({name: '', value: '', hidden: false});
            scope.changed();
          };
          scope.removeDataItem = function (index) {
            scope.item.data.splice(index, 1);
            scope.changed();
          };

          scope.addMilker = function () {
            var k = new Keeper();
            scope.item.keepers.push(k);
          };

          scope.setAsLast = function() {
            $rootScope.$broadcast('SEQUENCE-ITEM-AS-LAST', {item: scope.item});
          };
        }
      }
    }]);
