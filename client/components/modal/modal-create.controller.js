/**
 * Created by Leo on 26/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('ModalCreateCtrl', ['$scope','Logger', function ($scope, Logger) {
    $scope.selectFile = function() {
      angular.element('#network-data-file').trigger('click');
    };
    $scope.exclusion = 'jpg;gif;png;js;css;';


    function validate(exlist, url) {
      var result = $.grep(exlist, function(ext){
        return url.substr(url.length-ext.length-1, ext.length+1).toLowerCase()=='.'+ext.toLowerCase();
      });
      return !result || result.length<=0;
    }

    function parseJson(jsn){
      try {
        var step = 1;
        var exlist = $scope.exclusion.split(';');
        var jsondata = JSON.parse(jsn);
        var prev = '';
        if (jsondata.log && jsondata.log.entries && jsondata.log.entries.length>0){
          jsondata.log.entries.forEach(function(e){
            if (validate(exlist, e.request.url)) {
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
                  item.headers.push(h);
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

    function generateSequence(txt) {
      $scope.modal.info.items = [];
      if (txt.indexOf('{')==0)
        parseJson(txt);
      else if (txt.indexOf('<?xml ')==0)
        parseXml(txt);

      $scope.modal.idle = false;
      $scope.$apply();
    }

    $scope.setNetworkData = function(args) {
      $scope.modal.idle = true;
      $scope.$apply();
      var reader = new FileReader();
      reader.onload = function(e) {
        generateSequence(e.target.result);
      };
      reader.readAsText(args.files[0]);
    };
  }]);
