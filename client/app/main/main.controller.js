'use strict';

angular.module('webjsonizerApp')
  .directive("compareTo", function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return scope.otherModelValue && modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
  })
  .controller('MainCtrl', ['$scope','$rootScope','$http','$location','$timeout','socket','Auth','Logger',
    function ($scope,$rootScope,$http,$location,$timeout,socket,Auth,Logger) {
      $scope.version = '1.0.3';
      $scope.loginform = true;
      $scope.testJ = {id: ''};
      var _testTimeout = null;

      $http.get('assets/data/headers.json')
        .then(function (res) {
          $rootScope.headers = res.data;
        });

      if (!$rootScope.user) {
        $rootScope.user = {
          email: 'test@test.com',
          password: 'test'
        };
      }
      $scope.user = $rootScope.user;

      function resetErrors(skipsub) {
        if (!skipsub)
          $scope.submitted = false;
        $rootScope.errors = {};
        $scope.errors = $rootScope.errors;
      }

      if (!$rootScope.errors)
        resetErrors();

      $scope.toggle = function (lgn) {
        resetErrors();
        $scope.loginform = lgn;
      };

      $scope.login = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
          Auth.login({
              email: $scope.user.email,
              password: $scope.user.password
            })
            .then(function () {
              resetErrors();
              $location.path('/editor');
            })
            .catch(function (err) {
              $rootScope.errors.other = err.message;
            });
        }
      };

      $scope.register = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
          Auth.createUser({
              name: $scope.user.name,
              email: $scope.user.email,
              password: $scope.user.password
            })
            .then(function () {
              resetErrors();
              $location.path('/editor');
            })
            .catch(function (err) {
              err = err.data;
              resetErrors(false);
              // Update validity of form fields that match the mongoose errors
              angular.forEach(err.errors, function (error, field) {
                form[field].$setValidity('mongoose', false);
                $rootScope.errors[field] = error.message;
              });
            });
        }
      };

      $scope.recover = function () {
        Logger.info('[TODO] - Recover password tool...');
      };

      function loadTestSchema() {
        $scope.testIdle = true;
        if (!$scope.testJ.id)
          return $scope.clearTest();
        $http.get('/jsonize/schema/' + $scope.testJ.id)
          .then(function (resp) {
            $scope.testJ.ok = true;
            _.extend($scope.testJ, resp.data);
            $scope.testIdle = false;
          }, function () {
            $scope.testJ = {
              id: $scope.testJ.id,
              message: 'no jesonizer founded!'
            };
            $scope.testIdle = false;
          });
      }

      $scope.testChanged = function () {
        $scope.testIdle = true;
        if (_testTimeout)
          $timeout.cancel(_testTimeout);
        _testTimeout = $timeout(function () {
          loadTestSchema();
        }, 1000);
      };

      $scope.runTest = function() {
        $scope.testIdle = true;
        $http.post('/jsonize/' + $scope.testJ.id, $scope.testJ.parameters)
          .then(function(resp){
            $scope.testJ.result = resp.data;
            $scope.testIdle = false;
          }, function(err){
            Logger.error("Error jsonizing!", JSON.stringify(err));
            $scope.testIdle = false;
          });
      };

      $scope.clearTest = function() {
        $scope.testJ = { id: '' };
        $scope.testIdle = false;
      };

    }]);
