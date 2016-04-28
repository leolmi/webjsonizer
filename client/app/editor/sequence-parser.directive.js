/* Created by Leo on 28/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('sequenceParser', ['Modal',
    function (Modal) {
      return {
        restrict: 'E',
        scope: { sequence: '=ngModel' },
        templateUrl: 'app/editor/sequence-parser.html',
        link: function (scope, ele, atr) {
          scope.parserTypes = [{
            name: 'htmltable',
            desc: 'Html table'
          }, {
            name: 'json',
            desc: 'Json data'
          }, {
            name: 'custom',
            desc: 'Custom data'
          }, {
            name: 'none',
            desc: 'Generic content'
          }];

          scope.changed = function() {
            if (atr['ngChange'])
              ele.scope().$eval(atr['ngChange']);
          };

          scope.addTask = function() {
            if (!scope.sequence.parserOptions.pretasks)
              scope.sequence.parserOptions.pretasks = [];
            scope.sequence.parserOptions.pretasks.push({pattern:''});
            scope.changed();
          };

          scope.removeTask = function(index) {
            if (!scope.sequence) return;
            scope.sequence.parserOptions.pretasks.splice(index, 1);
            scope.changed();
          };

          var modalTest = Modal.confirm.test(function() {
            scope.sequence.parserOptions.pattern = scope.sequence.parserOptions.testPattern;
            scope.changed();
          });
          scope.test = function() {
            scope.sequence.parserOptions.testPattern = scope.sequence.parserOptions.pattern;
            var info = {
              data: scope.sequence.result ? scope.sequence.result.content : '',
              parserOptions: scope.sequence.parserOptions
            };
            modalTest(info);
          };
        }
      }
    }]);
