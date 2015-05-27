/**
 * Created by Leo on 22/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .directive('sequenceItem', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'E',
      scope: {item: '=ngModel', last:'=', index:'=', collapsed:'='},
      templateUrl: 'app/editor/sequence-item.html',
      link: function (scope, elm, atr) {
        scope.items = ["Ciccio","Bubo","Stallio"];
        scope.buttons = [{
          icon: 'fa-remove',
          action: function() { scope.$parent.removeItem(scope.index); }
        }];

        scope.addnew = function() {
          scope.$parent.newSequenceItem(scope.index);
        };

        scope.toggle = function() {
          scope.collapsed = !scope.collapsed;
        };

        scope.getShortDesc = function() {
          var path = scope.item.path || '<undefined>';
          return scope.item.method + ' - ' + path;
        };

        scope.$on('open-item', function(e, args){
          if (args.item == scope.item)
            scope.collapsed = false;
        });

        scope.properties = [{
          title:'Host',
          name:'host',
          placeholder: 'auto'
        },{
          title:'Method',
          name:'method',
          placeholder: 'GET'
        },{
          title:'Path',
          name:'path'
        },{
          title:'Referer',
          name:'referer'
        }];

        scope.changed = function() { $rootScope.$broadcast('MODIFIED'); };

        scope.addHeader = function() {
          scope.item.headers.push({name:'',value:'',hidden:false});
          scope.changed();
        };
        scope.removeHeader = function(index) {
          scope.item.headers.splice(index,1);
          scope.changed();
        };

        scope.addDataItem = function() {
          scope.item.data.push({name:'',value:'',hidden:false});
          scope.changed();
        };
        scope.removeDataItem = function(index) {
          scope.item.data.splice(index,1);
          scope.changed();
        };
      }
    }
  }]);
