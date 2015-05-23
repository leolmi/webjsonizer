/**
 * Created by Leo on 22/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .directive('sequenceItem', ['$location', function ($location) {
    return {
      restrict: 'E',
      scope: {item: '=ngModel', last:'=', index:'=', collapsed:'='},
      templateUrl: 'app/editor/sequence-item.html',
      link: function (scope, elm, atr) {

        scope.buttons = [{
          icon: 'fa-remove',
          action: function() { scope.$parent.removeItem(scope.index); }
        }];

        scope.toggle = function() {
          scope.collapsed = !scope.collapsed;
        };

        scope.getShortDesc = function() {
          return 'Descriione breve dell\'item';
        };

        scope.$on('open-item', function(e, args){
          if (args.item == scope.item)
            scope.collapsed = false;
        });
      }
    }
  }]);
