/* Created by Leo on 23/06/2015. */
'use strict';

angular.module('webjsonizerApp')
  .directive('tagEditor', [function () {
    return {
      restrict: 'E',
      scope: {tags: '=', alltags: '='},
      templateUrl: 'components/tag-editor/tag-editor.html',
      link: function (scope, elm, atr) {
        scope.focused = false;
        scope.delete = function(index) {
          scope.tags.splice(index, 1);
        };

        scope.addtag = function(e) {
          if (e.keyCode==13){
            if (scope.temptag) {
              scope.tags = _.union(scope.tags, [scope.temptag]);
              scope.temptag = '';
            }
          }
        };
      }
    }
  }]);
