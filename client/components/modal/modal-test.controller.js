/**
 * Created by Leo on 29/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('TestCtrl', ['$scope','$http','Logger', function ($scope,$http,Logger) {
    $scope.refresh = function() {
      if ($scope.evaluating){
        Logger.warning('Evaluation is running, please wait...');
        return;
      }
      $scope.evaluating = true;
      $http.post('api/sequence/test', $scope.modal.test)
        .success(function(json){
          $scope.result = json;
          $scope.iserror = false;
          $scope.evaluating = false;
        })
        .error(function(err){
          $scope.result = undefined;
          $scope.evaluating = false;
          $scope.iserror = true;
          $scope.result = JSON.stringify(err);
        });
    };
  }]);
