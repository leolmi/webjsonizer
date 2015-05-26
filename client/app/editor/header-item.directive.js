/**
 * Created by Leo on 25/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
    .directive('headerItem', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {header: '=ngModel', index:'='},
            templateUrl: 'app/editor/header-item.html',
            link: function (scope, elm, atr) {
              if ($rootScope.headers) {
                var names = [];
                $rootScope.headers.forEach(function(h){ names.push(h.name); });
                scope.headerNames = names;
              }

              function refreshValues() {
                var ch = $.grep($rootScope.headers, function (h) {
                  return h.name == scope.header.name;
                });
                scope.headerValues = (ch && ch.length) ? ch[0].values : [];
              }

              scope.nameChanged = function() {
                refreshValues();
                scope.changed();
              };

              scope.changed = function() { $rootScope.$broadcast('MODIFIED'); };

              scope.remove = function() { scope.$parent.removeHeader(scope.index); };

              refreshValues();
            }
        }
    }]);
