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

      var test = {
        data: $scope.modal.test.data,
        parserOptions: {
          type: $scope.modal.test.parserOptions.type,
          pattern: $scope.modal.test.parserOptions.testPattern,
          pretasks: $scope.modal.test.parserOptions.pretasks
        }
      };
      $http.post('api/sequence/test', test)
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
