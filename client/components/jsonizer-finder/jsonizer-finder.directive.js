/* Created by Leo on 03/05/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('jsonizerFinder', ['$http','$timeout','Logger',
    function ($http, $timeout,Logger) {
      return {
        restrict: 'E',
        scope: { },
        templateUrl: 'components/jsonizer-finder/jsonizer-finder.html',
        link: function (scope, elm, atr) {
          scope.searchText = '';
          scope.searchMessage = '';
          scope.searchIdle = false;
          scope.releases = [];
          var _findTimeout = null;

          scope.resetSearch = function() {
            scope.searchText = '';
            scope.releases = [];
            scope.searchMessage = '';
          };

          function search() {
            scope.searchIdle = true;
            scope.searchMessage = '';
            if (!scope.searchText || !scope.searchText.trim()) {
              scope.searchIdle = false;
              return;
            }
            $http.post('/api/sequence/search', {text: scope.searchText})
              .then(function (resp) {
                scope.releases = resp.data;
                scope.searchIdle = false;
                scope.searchMessage = (!scope.releases || scope.releases.length <= 0) ? 'no items' : 'founded ' + scope.releases.length + ' items';
              }, function (err) {
                scope.releases = [];
                scope.searchIdle = false;
                scope.searchMessage = 'no items';
              });
          }

          scope.searchChanged = function() {
            scope.searchIdle = true;
            if (_findTimeout)
              $timeout.cancel(_findTimeout);
            _findTimeout = $timeout(function () {
              search();
            }, 1000);
          };
        }
      }
    }]);
