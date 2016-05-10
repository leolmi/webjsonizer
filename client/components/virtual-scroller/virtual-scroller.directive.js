'use strict';

angular.module('webjsonizerApp')
  .directive('virtualScroller', [function () {
    return {
      restrict: 'E',
      scope: { options:'=' },
      templateUrl: 'components/virtual-scroller/virtual-scroller.html',
      link: function (scope, elm, atr) {
        var vsOptions = function(o) {
          if (o)
            _.extend(this, o);
        };
        vsOptions.prototype = {
          items: [],
          rowNum: true,
          topIndex: 0
        };

        scope._options = new vsOptions(scope.options);
      }
    }
  }]);
