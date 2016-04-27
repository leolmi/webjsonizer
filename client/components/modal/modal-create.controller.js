/**
 * Created by Leo on 26/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('ModalCreateCtrl', ['$scope','$timeout','Logger', function ($scope,$timeout,Logger) {
    $scope.selectFile = function() {
      $scope.modal.idle = true;
      angular.element('#network-data-file').trigger('click');
    };
    $scope.allexclusion = ['jpg','gif','png','js','css','ads','jsp','php','ico','json'];
    $scope.exclusion = ['jpg','gif','png','js','css','ads','jsp','php','ico','json'];

    $scope.file = undefined;

    function validate(exlist, url) {
      var result = $.grep(exlist, function(ext){
        return url.indexOf('.'+ext+'?')>0 || url.indexOf('.'+ext)==url.length-ext.length-1;
      });
      return !result || result.length<=0;
    }

    function parseJson(jsn){
      try {
        var step = 1;
        var jsondata = JSON.parse(jsn);
        var prev = '';
        var justheaders = [];
        if (jsondata.log && jsondata.log.entries && jsondata.log.entries.length>0){
          jsondata.log.entries.forEach(function(e){
            if (validate($scope.exclusion, e.request.url)) {
              var item = {
                title: 'step ' + step++,
                method: e.request.method,
                path: e.request.url,
                referer: prev
              };
              if (e.request.postData) {
                item.datatype =e.request.postData.mimeType;
                item.data = [];
                e.request.postData.params.forEach(function (p) {
                  item.data.push(p);
                });
              }
              if (e.request.headers) {
                item.headers = [];
                e.request.headers.forEach(function (h) {
                  //TODO : da migliorare, dovrebbe cercare l'ultimo header con tale nome.
                  if ($.grep(justheaders, function(xh){ return xh.name== h.name && xh.value== h.value;}).length<=0) {
                    item.headers.push(h);
                    justheaders.push(h);
                  }
                });
              }
              $scope.modal.info.items.push(item);
              prev = e.request.url;
            }
          });
        }
      }
      catch (err){
        Logger.error('Errors while parsing file',err);
      }
    }

    function parseXml(xml){
      //TODO: xml parser
      Logger.error('Xml parser is not yet available!');
    }

    function generateSequence(txt) {
      $scope.modal.info.items = [];
      if (txt.indexOf('{')==0)
        parseJson(txt);
      else if (txt.indexOf('<?xml ')==0)
        parseXml(txt);
      else
        Logger.error('No available parser!');

      $scope.$apply(function() { $scope.modal.idle = false;});
    }

    $scope.$watch('file', function() {
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

    $scope.setNetworkData = function(args) {
      $scope.$apply(function() { $scope.file = args.files[0]; });
    };
  }]);
