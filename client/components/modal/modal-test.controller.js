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

      //function parse() {
      //  if (_.isArray($scope.result)) {
      //    $scope.resultItems = _.map($scope.result, function(r){
      //      return _.map(_.keys(r), function(k) { return r[k]; });
      //    });
      //  }
      //}

      $scope.evaluating = true;
      $scope.resultItems = undefined;
      $http.post('api/sequence/test', $scope.modal.test)
        .success(function(json){
          $scope.result = json;
          $scope.iserror = false;
          $scope.evaluating = false;
          //parse();
        })
        .error(function(err){
          $scope.result = undefined;
          $scope.evaluating = false;
          $scope.iserror = true;
          $scope.result = JSON.stringify(err);
        });
    };
  }]);
