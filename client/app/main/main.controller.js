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
  .controller('MainCtrl', ['$scope','$rootScope','$http','$location','socket','Auth','Logger', function ($scope,$rootScope,$http,$location,socket,Auth,Logger) {
    $scope.version = '1.0.3';
    $scope.loginform = true;

    $http.get('assets/data/headers.json')
      .then(function(res){
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

    $scope.toggle = function(lgn) {
      resetErrors();
      $scope.loginform = lgn;
    };

    $scope.login = function(form) {
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

    $scope.register = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
          .then( function() {
            resetErrors();
            $location.path('/editor');
          })
          .catch( function(err) {
            err = err.data;
            resetErrors(false);
            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $rootScope.errors[field] = error.message;
            });
          });
      }
    };

    $scope.recover = function() {
      Logger.info('[TODO] - Recover password tool...');
    };

    //$scope.awesomeThings = [];
    // $http.get('/api/things').success(function(awesomeThings) {
    //  $scope.awesomeThings = awesomeThings;
    //  socket.syncUpdates('thing', $scope.awesomeThings);
    //});
    //
    //$scope.addThing = function() {
    //  if($scope.newThing === '') {
    //    return;
    //  }
    //  $http.post('/api/things', { name: $scope.newThing });
    //  $scope.newThing = '';
    //};
    //
    //$scope.deleteThing = function(thing) {
    //  $http.delete('/api/things/' + thing._id);
    //};
    //
    //$scope.$on('$destroy', function () {
    //  socket.unsyncUpdates('thing');
    //});
  }]);
