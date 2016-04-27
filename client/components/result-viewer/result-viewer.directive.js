'use strict';

angular.module('webjsonizerApp')
  .directive('resultViewer', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/result-viewer/result-viewer.html',
      scope: { result:'=' },
      link: function(scope, ele, atr) {
        function parse() {
          if (_.isArray(scope.result)) {
            scope.resultItems = _.map(scope.result, function(r){
              return _.map(_.keys(r), function(k) { return r[k]; });
            });
          }
        }

        scope.$watch('result', function() {
          parse();
        });
      }
    };
  });
