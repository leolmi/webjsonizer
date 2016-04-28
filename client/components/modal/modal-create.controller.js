/**
 * Created by Leo on 26/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('ModalCreateCtrl', ['$scope','$timeout','Logger', 'URL',
    function ($scope,$timeout,Logger, URL) {
      $scope.selectFile = function () {
        $scope.sequenceError = null;
        $scope.modal.idle = true;
        angular.element('#network-data-file').trigger('click');
      };
      $scope.allexclusion = ['jpg', 'gif', 'png', 'js', 'css', 'ads', 'jsp', 'php', 'ico', 'json',];
      $scope.exclusion = ['jpg', 'gif', 'png', 'js', 'css', 'ads', 'jsp', 'ico', 'json'];
      $scope.allMimeTypes = ['*', 'text/', 'text/plain', 'text/html', 'text/richtext', 'text/x-component'];
      $scope.includeMimeTypes = ['text/'];

      $scope.file = undefined;

      function validate(exlist, url, mimetype) {
        if (!url || !mimetype) return false;
        var result = _.find(exlist, function (ext) {
          return url.indexOf('.' + ext + '?') > 0 || url.indexOf('.' + ext) == url.length - ext.length - 1;
        });
        if (result) return false;
        if ($scope.includeMimeTypes.indexOf('*') > -1 || !$scope.includeMimeTypes.length) return true;
        result = _.find($scope.includeMimeTypes, function (mt) {
          return mimetype.indexOf(mt) > -1;
        });
        return result ? true : false;
      }

      function parseJson(jsn) {
        try {
          var step = 1;
          var jsondata = JSON.parse(jsn);
          var prev = '';
          var justheaders = [];
          if (jsondata.log && jsondata.log.entries && jsondata.log.entries.length > 0) {
            jsondata.log.entries.forEach(function (e) {
              var mimeType = (e.response && e.response.content) ? e.response.content.mimeType : null;
              var url = e.request ? e.request.url : null;
              if (validate($scope.exclusion, url, mimeType)) {
                var U = new URL(e.request.url);
                var item = {
                  title: 'step ' + step++,
                  method: e.request.method,
                  path: U.pathsearchname,
                  host: U.hostname,
                  referer: prev
                };
                if (e.request.postData) {
                  item.datatype = e.request.postData.mimeType;
                  item.data = [];
                  e.request.postData.params.forEach(function (p) {
                    item.data.push(p);
                  });
                }
                if (e.request.headers) {
                  item.headers = [];
                  e.request.headers.forEach(function (h) {
                    //TODO : da migliorare, dovrebbe cercare l'ultimo header con tale nome.
                    if (!_.find(justheaders, function (xh) {
                        return xh.name == h.name && xh.value == h.value;
                      })) {
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
        catch (err) {
          Logger.error('Errors while parsing file', err);
        }
      }

      function parseXml(xml) {
        //TODO: xml parser
        Logger.error('Xml parser is not yet available!');
      }

      function generateSequence(txt) {
        $scope.modal.info.items = [];
        if (txt.indexOf('{') == 0)
          parseJson(txt);
        else if (txt.indexOf('<?xml ') == 0)
          parseXml(txt);
        else {
          $scope.sequenceError = 'Invalid file content!';
          Logger.error('Invalid file content!');
        }

        $timeout(function () {
          $scope.modal.idle = false;
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
