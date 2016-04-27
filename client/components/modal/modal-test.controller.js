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
      $scope.resultItems = undefined;
      $scope.result = undefined;
      $http.post('api/sequence/test', $scope.modal.test)
        .then(function(resp){
          $scope.result = resp.data;
          $scope.iserror = false;
          $scope.evaluating = false;
        }, function(err){
          $scope.evaluating = false;
          $scope.iserror = true;
          if (_.isString(err.data))
            $scope.result = ''+err.data;
          else if (_.isString(err.message))
            $scope.result = ''+err.message;
          else
            $scope.result = JSON.stringify(err);
        });
    };
  }]);
