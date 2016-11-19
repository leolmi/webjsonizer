/* Created by Leo on 19/11/2016. */
'use strict';

angular.module('webjsonizerApp')
  .directive('jsonizerCode', ['$http','$timeout','$rootScope','util',
    function ($http, $timeout,$rootScope,util) {
      return {
        restrict: 'E',
        controller: function($scope) {
          $scope.editor = null;
          $scope.cm = {
            options:{
              mode: {name: "javascript", json: true},
              indentWithTabs: true,
              smartIndent: true,
              lineWrapping: true,
              lineNumbers: true,
              matchBrackets: true,
              autoFocus: true,
              readOnly: true,
              theme: 'blackboard',
              viewportMargin: Infinity,
              onLoad:function(cm){
                $scope.editor = cm;
              }
            },
            code:''
          };
        },
        scope: {},
        templateUrl: 'components/jsonizer-code/jsonizer-code.html',
        link: function (scope, elm, atr) {

          var _template = {
            url: 'var url = \'https://jsonizer.herokuapp.com/jsonize/{id}\';\n',
            data: 'var data = {\n{0}\n}\n',
            lng: {
              jquery: {
                header: '\n/* jQuery sample */\n',
                http_nodata: '$.ajax({\n\ttype: \'post\',\n\turl: url,\n\tsuccess: function(resp){\n',
                http_data: '$.ajax({\n\ttype: \'post\',\n\turl: url,\n\tdata: data,\n\tsuccess: function(resp){\n',
                then: '\t\tvar result = JSON.parse(resp);\n' +
                '\t\tresult.type;  //type of result (es:htmltable)\n' +
                '\t\tresult.data;  //array af rows\n'+
                '\t},\n\terror: function(jqXHR, textStatus, err){\n' +
                '\t\tthrow err;\n' +
                '\t});'
              },
              angular: {
                header: '\n\n\n/* Angular sample */\n',
                http_nodata: '$http({method: \'post\', url: url})\n',
                http_data: '$http({method: \'post\', url: url, data:data})\n',
                then: '\t.then(function(resp){\n' +
                      '\t\tvar result = resp.data;\n' +
                      '\t\tresult.type;  //type of result (es:htmltable)\n' +
                      '\t\tresult.data;  //array af rows\n'+
                      '\t}, function(err){\n' +
                      '\t\tthrow err;\n' +
                      '\t});'
              }
            }
          };

          $rootScope.$on('TEST-SEQUENCE-LOADED', function(e, data) {
            var j = data['J'];

            var code = util.format(_template.url, j);

            var hasdata = j.parameters && j.parameters.length;
            if (hasdata) {
              var params = '';
              j.parameters.forEach(function (p) {
                if (params) params += ',\n';
                params += '\t' + p.name + ' = ' + p.name + '_value';
              });
              code += util.format(_template.data, [params]);
            }

            for(var lng in _template.lng) {
              code += _template.lng[lng].header;
              code += (hasdata) ? _template.lng[lng].http_data : _template.lng[lng].http_nodata;
              code += _template.lng[lng].then;
            }

            scope.cm.j = j;
            scope.cm.code = code;
          });
        }
      }
    }]);
