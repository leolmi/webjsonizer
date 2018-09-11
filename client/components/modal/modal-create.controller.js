/**
 * Created by Leo on 26/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('ModalCreateCtrl', ['$scope','$timeout','$element','Logger', 'URL','networkParser',
    function ($scope,$timeout,$element,Logger, URL, networkParser) {
      $scope.selectFile = function () {
        $scope.sequenceError = null;
        $scope.modal.idle = true;
        $timeout(function () {
          angular.element('#network-data-file').trigger('click');
        }, 100);
      };
      $scope.parserOptions = networkParser.options;
      $scope.file = undefined;
      $scope.mode = '';
      $scope.modal.apply = function() {
        switch ($scope.mode) {
          case 'url':
            $scope.modal.info.items = [];
            networkParser.parseUrl($scope.modal.url, function(err, item){
              if (err) {
                $scope.sequenceError = err.message;
              } else {
                $scope.modal.info.items.push(item);
              }
            });
            break;
        }
      };
      $scope.modal.leftbuttons = [];
      //   classes: 'btn-primary',
      //   text: '<<',
      //   disabled: function() {
      //     return $scope.mode == '';
      //   },
      //   click: function(e){
      //     $scope.mode = '';
      //   }
      // }];


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

      $scope.setMode = function(mode) {
        $scope.mode = mode;
      };

      $timeout(function() {
        $('#jsonizer-title', $element).select();
      }, 200);

    }]);
