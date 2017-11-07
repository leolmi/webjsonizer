/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('EditorCtrl', ['$scope','$rootScope','$http','$timeout','$location','Auth','Logger','Modal','util','Sequence','SequenceItem','Parameter',
    function ($scope,$rootScope,$http,$timeout,$location,Auth,Logger,Modal,util,Sequence,SequenceItem,Parameter) {
      $scope.sequence = undefined;
      $scope.user = Auth.getCurrentUser();
      $scope.modified = false;
      $scope.debug = false;
      $scope.menuActive = false;
      $scope.test = {};
      $scope.jsutil = false;
      $scope.toggleDebug = function () {
        $scope.debug = !$scope.debug;
      };
      $scope.toggleMenu = function() {
        $scope.menuActive = !$scope.menuActive;
      };

      $scope.cmOptions = {
        mode: {name: "javascript", json: true},
        indentWithTabs: true,
        smartIndent: true,
        lineWrapping: true,
        lineNumbers: true,
        matchBrackets: true,
        autoFocus: true,
        readOnly: false,
        viewportMargin: Infinity,
        onLoad:function(cm){
          $scope.editor = cm;
        }
      };

      function notifyModifies(modified) {
        $scope.modified = modified == undefined ? true : modified;
      }

      function getSequenceAddress(postfix) {
        return $scope.sequence ? "https://jsonizer.herokuapp.com/jsonize/" + (postfix || '') + $scope.sequence._id : '<undefined>';
      }

      $scope.newSequenceItem = function (index) {
        var i = $scope.sequence.items;
        index = index == undefined ? i.length : index;
        var prev = index > 0 ? i[index - 1] : undefined;
        var host = prev ? prev.host : '';
        var item = new SequenceItem({host:host});

        $scope.sequence.items.splice(index, 0, item);
        notifyModifies();
        $timeout(function () {
          $scope.$broadcast('open-item', {item: i[index]});
        }, 30);
      };

      var modalDelete = Modal.confirm.ask(function (seq) {
        $http.delete('/api/sequence/' + seq._id)
          .then(function () {
            removeSequence(seq._id)
            $scope.sequence = undefined;
            refreshAllSequences();
            Logger.ok('Sequence "' + seq.title + '" deleted!');
          }, function (err) {
            Logger.error("Error deleting sequence", JSON.stringify(err));
          });
      });

      $scope.deleteSequence = function () {
        var opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, $scope.sequence.title);
        modalDelete(opt, $scope.sequence);
      };

      function play() {
        return $http.post('/api/sequence/play', $scope.sequence);
      }

      function manageTestResults() {
        if (_.isArray($scope.test.result)) {
          $scope.test.resultItems = _.map($scope.test.result, function(r){
            return _.map(_.keys(r), function(k) { return r[k]; });
          });
        }
      }

      $scope.checkTest = function() {
        if (!$scope.sequence.result) {
          $scope.checkPlay();
        } else {
          $scope.runTest();
        }
      };

      $scope.runTest = function () {
        $scope.test.parsing = true;
        $scope.test.resultItems = undefined;
        var data = {
          data: $scope.sequence.result ? $scope.sequence.result.content : '',
          parserOptions: $scope.sequence.parserOptions
        };
        $http.post('api/sequence/test', data)
          .then(function (testres) {
            $scope.test.result = testres.data;
            manageTestResults();
            $scope.test.parsing = false;
          }, function (err) {
            $scope.test.error = JSON.stringify(err);
            $scope.test.parsing = false;
          });
      };


      /**
       * Esegue la sequenza
       */
      $scope.play = function (cb) {
        $scope.test.playing = true;
        $scope.test.resultItems = undefined;
        play()
          .then(function(playres){
            $scope.sequence.result = playres.data;
            $scope.test.playing = false;
            if (cb) cb();
          }, function(err){
            $scope.test.error = JSON.stringify(err);
            $scope.test.playing = false;
          });
      };

      $scope.sample = function() {
        var jsExec = [
          'var url = \''+getSequenceAddress()+'\';'];
        if ($scope.sequence.parameters.length) {
          jsExec.push('var data = {');
          $scope.sequence.parameters.forEach(function (p, i) {
            if (!p.hidden)
              jsExec.push('  ' + p.name + ': \'value_of_' + p.name + '\'');
          });
          jsExec.push.apply(jsExec, ['};','$http.post(url, data)']);
        } else {
          jsExec.push.apply(jsExec, ['$http.post(url)']);
        }
        jsExec.push.apply(jsExec, [
          '  .then(function(resp){',
          '    //use resp.data as json',
          '  }, function(err) {',
          '    //handle errors',
          '  });']);

        var jsSchema = [
          'var url = \''+getSequenceAddress('schema/')+'\';',
          '$http.get(url)',
          '  .then(function(resp){',
          '    var schema = resp.data;',
          '    // schema.title: title of the jsonize',
          '    // schema.desc: description of the jsonize',
          '    // schema.parameters: public parameters of the jsonize',
          '  }, function(err) {',
          '    //handle errors',
          '  });'];

        $scope.overpage = {
          template: 'app/overpages/overpage-sample.html',
          running: true,
          title: $scope.sequence.title,
          sampleSchema: jsSchema.join('\n'),
          sampleExec: jsExec.join('\n')
        };
      };


      $scope.checkPlay = function(cb) {
        var ps = _.filter($scope.sequence.parameters, function(p) {
          return !p.hidden;
        });
        var modalParameters = Modal.confirm.parameters(function (info) {
          $scope.play(cb);
        });
        if (ps.length>0) {
          modalParameters(ps);
        } else {
          $scope.play(cb);
        }
      };

      $scope.save = function () {
        var seq = $scope.sequence;
        if (!seq || !$scope.modified) return;
        $http.put('/api/sequence/' + seq._id, seq)
          .then(function () {
            notifyModifies(false);
            Logger.ok('Sequence ' + seq.title + ' updated');
            reload(seq._id);
          }, function (err) {
            Logger.error('Error updating sequence ' + seq.title, JSON.stringify(err));
          });
      };

      $scope.closeOverlay = function () {
        $scope.overpage = undefined;
      };


      function createSequence(seqinfo) {
        $http.post('/api/sequence', seqinfo)
          .then(function (seq) {
            refreshAllSequences();
            $scope.open(seq);
          }, function (err) {
            Logger.error("Error creating new sequence", JSON.stringify(err));
          });
      }

      var modalCreate = Modal.confirm.create(function (seqinfo) {
        createSequence(seqinfo);
      });

      $scope.newSequence = function () {
        var sequence = new Sequence();
        modalCreate(sequence);
      };

      $scope.closeSequence = function () {
        checkToUpdateSequence(function () {
          $scope.sequence = undefined;
        });
      };

      function clearResult() {
        $scope.sequence.result = null;
        $scope.test = {};
      }

      $scope.setFile = function(args) {
        if (args.files[0]) {
          var reader = new FileReader();
          reader.onload = function (e) {
            try {
              var sequence = JSON.parse(e.target.result);
              createSequence(sequence);
            } catch(err){
              Logger.error("Error loading file", JSON.stringify(err));
            }
          };
          reader.readAsText(args.files[0]);
        }
      };

      $scope.importSequence = function() {
        $timeout(function() { $(':file').trigger('click'); }, 0);
      };

      function exportSequence() {
        var clone = _.cloneDeep($scope.sequence);
        delete clone.result;
        delete clone.__v;
        util.depure(clone.items);
        clone.items.forEach(function(i){
          util.depure(i.headers);
          util.depure(i.keepers);
          util.depure(i.data);
        });
        util.depure(clone.parameters);
        delete clone.owner;
        util.depure(clone);
        var json = JSON.stringify(clone, null, 2);
        var data = new Blob([json], { type: 'text/plain;charset=utf-8' });
        saveAs(data, clone.title+'.json');
      }

      $scope.parameterTypes = [
        {desc:'Standard', value:''},
        {desc:'Password', value:'password'}];

      $scope.buttons = [{
        icon: 'fa-eraser',
        action: clearResult,
        tooltip: 'Clear results',
        isactive: function () {
          return $scope.sequence && $scope.sequence.result;
        }
      }, {
        icon: 'fa-times',
        action: $scope.closeSequence,
        tooltip: 'Close current sequence',
        isactive: function () {
          return $scope.sequence;
        }
      }, {
        icon: 'fa-magic',
        action: $scope.newSequence,
        tooltip: 'Build new sequence'
      }, {
        separator: true
      }, {
        icon: 'fa-download',
        action: exportSequence,
        tooltip: 'Export current sequence'
      }, {
        icon: 'fa-cloud-upload',
        action: $scope.importSequence,
        tooltip: 'Import sequence'
      }, {
        separator: true
      }, {
        icon: 'fa-save',
        action: $scope.save,
        tooltip: 'Save current sequence',
        isactive: function () {
          return $scope.modified && $scope.sequence;
        }
      }, {
        icon: 'fa-trash',
        action: $scope.deleteSequence,
        tooltip: 'Delete current sequence'
      }];

      function removeSequence(id) {
        var result = $.grep($scope.sequences, function (s) {
          return s._id == id;
        });
        if (!result || result.length <= 0) return;
        var index = $scope.sequences.indexOf(result[0]);
        $scope.sequences.splice(index, 1);
      }


      function refreshAllSequences(cb) {
        $http.get('/api/sequence')
          .then(function (sequences) {
            $scope.sequences = sequences;
            if (cb) cb();
          }, function (err) {
            Logger.error('Error loading sequences', JSON.stringify(err));
            if (cb) cb();
          });
      }

      function reload(id) {
        refreshAllSequences(function () {
          $scope.sequence = null;
          var seq = _.find($scope.sequences, function (s) {
            return s._id == id;
          });
          if (seq)
            $scope.open(seq);
        });
      }

      $scope.setParameterType = function(p, bt){
        p.type = bt.value;
        $scope.changed();
      };

      $scope.setDefault = function(p) {
        p.default = p.value;
      };

      $scope.reset = function(p) {
        p.value = p.default;
      };

      $scope.logout = function () {
        $rootScope.user = {};
        Auth.logout();
        $location.path('/');
      };

      /**
       * toggle star from sequence
       * @param e
       * @param sequence
       */
      $scope.star = function (e, sequence) {
        e.preventDefault();
        e.stopPropagation();
        sequence.star = !sequence.star;
        $http.post('/api/sequence/star', sequence)
          .then(function () {
            Logger.ok('Star updated');
          }, function (err) {
            Logger.error('Error star sequence', JSON.stringify(err));
          });
      };

      var modalSaveChanges = Modal.confirm.ask(function (seq, cb, res) {
        if (res == 'no') {
          return refreshAllSequences(cb);
        }
        $http.put('/api/sequence/' + seq._id, seq)
          .then(function () {
            Logger.ok('Sequence "' + seq.title + '" updated!');
            reload(seq._id);
            cb();
          }, function (err) {
            Logger.error("Error updating sequence", JSON.stringify(err));
          });
      });

      function checkToUpdateSequence(cb) {
        if (!$scope.modified || !$scope.sequence) return cb();
        var seq = $scope.sequence;
        var opt = Modal.confirm.getAskOptions(Modal.MODAL_YESNOCANCEL);
        opt.title = 'Save Changes';
        opt.body = '<p>The sequence <strong>' + seq.title + '</strong> has been changed. Do you want to save it before closing?</p>';
        modalSaveChanges(opt, seq, cb);
      }

      function refreshJSUtil(focus) {
        $timeout(function() {
          if ($scope.editor && ($scope.jsutil || $scope.sequence.jsutil)) {
            $scope.editor.refresh();
            if (focus) $scope.editor.focus();
          }
        }, 250);
      }

      $scope.activateJSUtil = function() {
        $scope.jsutil = true;
        refreshJSUtil(true);
      };

      $scope.open = function (raw) {
        if ($scope.sequence && raw._id == $scope.sequence._id) return;
        checkToUpdateSequence(function () {
          $scope.sequence = new Sequence(raw);
          $scope.address = getSequenceAddress();
          notifyModifies(false);
          $scope.closeOverlay();
          $scope.menuActive = false;
          $scope.jsutil = false;
          refreshJSUtil();
        })
      };

      $scope.addParameter = function () {
        if (!$scope.sequence) return;
        $scope.sequence.parameters.push(new Parameter());
        notifyModifies();
      };

      $scope.removeParameter = function (index) {
        if (!$scope.sequence) return;
        $scope.sequence.parameters.splice(index, 1);
        notifyModifies();
      };

      $scope.changed = function () {
        notifyModifies();
      };

      $scope.togglePublic = function (p) {
        p.hidden = !p.hidden;
        notifyModifies();
      };

      $scope.profile = function() {
        //TODO: impostazioni utente (cambio password, nome utente)
        Logger.info('[TODO] - Profile settings tool...');
      };

      $scope.popupMenu = function() {
        $('.dropdown-toggle').dropdown();
      };

      $scope.$on('MODIFIED', function () {
        notifyModifies();
      });

      var modalPublish = Modal.confirm.ask(function () {
        $http.get('/api/sequence/publish/'+$scope.sequence._id)
          .then(function(){
            reload($scope.sequence._id);
          }, function(err){
            Logger.error('Error on publish sequence', JSON.stringify(err));
          })
      });

      $scope.publish = function() {
        var opt = Modal.confirm.getAskOptions(Modal.MODAL_PUBLISH, $scope.sequence.title);
        modalPublish(opt);
      };



      var modalDeleteRelease = Modal.confirm.ask(function (obj) {
        $http.delete('/api/sequence/'+obj.rel._id)
          .then(function() {
            Logger.info('Release Deleted', 'Release v.'+obj.rel.version+' deleted successfully');
            obj.cb();
          }, function(err){
            Logger.error('Error on deleting release', JSON.stringify(err));
          });
      });

      $scope.manageReleases = function() {
        function loadReleases(o) {
          o.loading = true;
          $http.get('/api/sequence/releases/'+$scope.sequence._id)
            .then(function (result) {
              o.loading = false;
              o.releases = result.data;
            }, function(err){
              o.loading = false;
              o.error = JSON.stringify(err);
            });
        }
        $scope.overpage = {
          template: 'app/overpages/overpage-releases.html',
          loading: true,
          releases: [],
          title: 'Releases of ' + $scope.sequence.title,
          remove: function(rel) {
            var self = this;
            var opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, 'version ' + rel.version);
            var obj = {
              rel: rel,
              cb: function() { loadReleases(self); }
            };
            modalDeleteRelease(opt, obj);
          }
        };
        loadReleases($scope.overpage);
      };

      $rootScope.$on('NEW-SEQUENCE-ITEM-REQUEST', function(e, data){
        $scope.newSequenceItem(data.index);
      });

      $rootScope.$on('REMOVE-SEQUENCE-ITEM', function(e, data){
        if (data) util.remove($scope.sequence.items, data.item, notifyModifies);
      });

      $rootScope.$on('REMOVE-SEQUENCE-ITEM-KEEPER', function(e, data){
        if (data && data.item)
          util.remove(data.item.keepers, data.keeper, notifyModifies);
      });

      $rootScope.$on('SEQUENCE-TEST-REFRESH', function(){
        test();
      });


      $rootScope.$on('SEQUENCE-ITEM-AS-LAST', function(e, data) {
        if (data && data.item) {
          var found = false;
          $scope.sequence.items.forEach(function (i) {
            i.skip = found;
            if (i === data.item) found = true;
          });
        }
      });

      $scope.$watch('overpage', function() {
        $rootScope.overpageOn = $scope.overpage ? true : false;
      });


      refreshAllSequences();
    }]);
