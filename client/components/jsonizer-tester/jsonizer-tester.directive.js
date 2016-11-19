/* Created by Leo on 03/05/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('jsonizerTester', ['$http','$timeout','$rootScope','Logger',
    function ($http, $timeout, $rootScope, Logger) {
      return {
        restrict: 'E',
        scope: { },
        templateUrl: 'components/jsonizer-tester/jsonizer-tester.html',
        link: function (scope, elm, atr) {
          scope.testJ = {id: ''};
          var _testTimeout = null;

          function loadTestSchema() {
            scope.testIdle = true;
            scope.testJ.result = null;
            if (!scope.testJ.id)
              return scope.clearTest();
            $http.get('/jsonize/schema/' + scope.testJ.id)
              .then(function (resp) {
                scope.testJ.ok = true;
                _.extend(scope.testJ, resp.data);
                $rootScope.$broadcast('TEST-SEQUENCE-LOADED', {J:scope.testJ});
                scope.testIdle = false;
              }, function () {
                scope.testJ = {
                  id: scope.testJ.id,
                  message: 'no jsonizer founded!'
                };
                scope.testIdle = false;
              });
          }

          scope.testChanged = function () {
            scope.testIdle = true;
            if (_testTimeout)
              $timeout.cancel(_testTimeout);
            _testTimeout = $timeout(function () {
              loadTestSchema();
            }, 1000);
          };

          scope.runTest = function() {
            scope.testIdle = true;
            $http.post('/jsonize/' + scope.testJ.id, scope.testJ.parameters)
              .then(function(resp){
                scope.testJ.result = resp.data;
                scope.testIdle = false;
              }, function(err){
                Logger.error("Error jsonizing!", JSON.stringify(err));
                scope.testJ.result = null;
                scope.testIdle = false;
              });
          };

          scope.clearTest = function() {
            scope.testJ = { id: '' };
            scope.testIdle = false;
          };

          var default_tab = {name:'json'};
          scope.tabs = {
            items:[
              default_tab,
              {name:'table'}],
            current:default_tab
          };

          scope.isCurrent = function(tabName) {
            return scope.tabs.current && scope.tabs.current.name==tabName;
          };

          $rootScope.$on('TEST-THIS-SEQUENCE', function(e, data){
            scope.testJ.id = data.id;
            scope.testChanged();
          });
        }
      }
    }]);
