/**
 * Created by Leo on 26/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('ModalCreateCtrl', ['$scope','$timeout','Logger', 'URL','networkParser',
    function ($scope,$timeout,Logger, URL, networkParser) {
      $scope.selectFile = function () {
        $scope.sequenceError = null;
        $scope.modal.idle = true;
        $timeout(function () {
          angular.element('#network-data-file').trigger('click');
        }, 100);
      };
      $scope.parserOptions = networkParser.options;
      $scope.file = undefined;

      function generateSequence(content) {
        $scope.sequenceError = null;
        $scope.modal.info.items = [];
        networkParser.parse(content, function(err, items){
          if (err) {
            $scope.sequenceError = err.message;
          } else {
            $scope.modal.info.items = items;
          }
          $timeout(function () {
            $scope.modal.idle = false;
          });
        });
      }

      $scope.$watch('file', function () {
        if (!$scope.file) {
          $scope.modal.idle = false;
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          generateSequence(e.target.result);
        };
        reader.readAsText($scope.file);
      });

      $scope.setNetworkData = function (args) {
        $timeout(function () {
          $scope.modal.idle = true;
          $scope.file = args.files[0];
        });
      };
    }]);
