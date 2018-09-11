/* Created by Leo on 03/05/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('jsonizerTester', ['$http','$timeout','$rootScope','Logger','util','JSONIZER_CONSTANT',
    function ($http, $timeout, $rootScope, Logger, util, JSONIZER_CONSTANT) {
      return {
        restrict: 'E',
        scope: { },
        templateUrl: 'components/jsonizer-tester/jsonizer-tester.html',
        link: function (scope) {
          scope.testJ = {id: ''};
          scope.URL = JSONIZER_CONSTANT.url;
          let _testTimeout = null;

          function loadTestSchema() {
            scope.testIdle = true;
            scope.testJ.result = null;
            if (!scope.testJ.id) {
              return scope.clearTest();
            }
            $http.get('/jsonize/schema/' + scope.testJ.id)
              .then(function (resp) {
                scope.testJ.ok = true;
                _.extend(scope.testJ, resp.data);
                $rootScope.$broadcast('TEST-SEQUENCE-LOADED', {J:scope.testJ});
                scope.testIdle = false;
              }, function (err) {
                scope.testJ = {
                  id: scope.testJ.id,
                  message: 'no jsonizer founded!'
                };
                scope.testIdle = false;
                console.error(err);
              });
          }

          scope.testChanged = function () {
            scope.testIdle = true;
            if (_testTimeout) {
              $timeout.cancel(_testTimeout);
            }
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

          scope.copyTest = function() {
            const txt =  JSONIZER_CONSTANT.url + scope.testJ.id;
            util.copyToClipboard(txt);
            Logger.ok('Url copied in clipboard!');
          };

          const defaultTab = {name:'json'};
          scope.tabs = {
            items:[
              defaultTab,
              {name:'table'}],
            current:defaultTab
          };

          scope.isCurrent = function(tabName) {
            return scope.tabs.current && scope.tabs.current.name===tabName;
          };

          $rootScope.$on('TEST-THIS-SEQUENCE', function(e, data){
            scope.testJ.id = data.id;
            scope.testChanged();
          });
        }
      }
    }]);
