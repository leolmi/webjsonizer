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
        mode: {name: 'javascript', json: true},
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
        $scope.modified = modified === undefined ? true : modified;
      }

      function getSequenceAddress(postfix) {
        return $scope.sequence ? 'https://jsonizer.herokuapp.com/jsonize/' + (postfix || '') + $scope.sequence._id : '<undefined>';
      }

      $scope.newSequenceItem = function (index) {
        const i = $scope.sequence.items;
        index = index === undefined ? i.length : index;
        const prev = index > 0 ? i[index - 1] : undefined;
        const host = prev ? prev.host : '';
        const item = new SequenceItem({host:host});

        $scope.sequence.items.splice(index, 0, item);
        notifyModifies();
        $timeout(() => $scope.$broadcast('open-item', {item: i[index]}), 30);
      };

      const modalDelete = Modal.confirm.ask(function (seq) {
        $http.delete('/api/sequence/' + seq._id)
          .then(() => {
            removeSequence(seq._id);
            $scope.sequence = undefined;
            refreshAllSequences();
            Logger.ok('Sequence "' + seq.title + '" deleted!');
          }, (err) => Logger.error('Error deleting sequence', JSON.stringify(err)));
      });

      $scope.deleteSequence = function () {
        const opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, $scope.sequence.title);
        modalDelete(opt, $scope.sequence);
      };

      function play() {
        return $http.post('/api/sequence/play', $scope.sequence);
      }

      function manageTestResults() {
        if (_.isArray($scope.test.result)) {
          $scope.test.resultItems = _.map($scope.test.result, (r) => _.map(_.keys(r), (k) => r[k]));
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
        const data = {
          data: $scope.sequence.result ? $scope.sequence.result.content : '',
          parserOptions: $scope.sequence.parserOptions
        };
        $http.post('api/sequence/test', data)
          .then((resp) => {
            $scope.test.result = resp.data;
            manageTestResults();
            $scope.test.parsing = false;
          }, (err) => {
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
          .then((resp) => {
            $scope.sequence.result = resp.data;
            $scope.test.playing = false;
            if (cb) {cb();}
          }, (err) => {
            $scope.test.error = JSON.stringify(err);
            $scope.test.playing = false;
          });
      };

      $scope.sample = function() {
        const jsExec = [
          'var url = \''+getSequenceAddress()+'\';'];
        if ($scope.sequence.parameters.length) {
          jsExec.push('var data = {');
          $scope.sequence.parameters.forEach((p) => {
            if (!p.hidden) {jsExec.push('  ' + p.name + ': \'value_of_' + p.name + '\'');}
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

        const jsSchema = [
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
        const ps = _.filter($scope.sequence.parameters,(p) => !p.hidden);
        const modalParameters = Modal.confirm.parameters(() => $scope.play(cb));
        if (ps.length>0) {
          modalParameters(ps);
        } else {
          $scope.play(cb);
        }
      };

      $scope.save = function () {
        const seq = $scope.sequence;
        if (!seq || !$scope.modified) {return;}
        $http.put('/api/sequence/' + seq._id, seq)
          .then(() => {
            notifyModifies(false);
            Logger.ok('Sequence ' + seq.title + ' updated');
            reload(seq._id);
          }, (err) => Logger.error('Error updating sequence ' + seq.title, JSON.stringify(err)));
      };

      $scope.closeOverlay = function () {
        $scope.overpage = undefined;
      };


      function createSequence(seqinfo) {
        $http.post('/api/sequence', seqinfo)
          .then((resp) => {
            refreshAllSequences();
            $scope.open(resp.data);
          }, (err) => Logger.error('Error creating new sequence', JSON.stringify(err)));
      }

      const modalCreate = Modal.confirm.create(function (seqinfo) {
        createSequence(seqinfo);
      });

      $scope.newSequence = function () {
        const sequence = new Sequence();
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
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const sequence = JSON.parse(e.target.result);
              createSequence(sequence);
            } catch(err){
              Logger.error('Error loading file', JSON.stringify(err));
            }
          };
          reader.readAsText(args.files[0]);
        }
      };

      $scope.importSequence = function() {
        $timeout(() => $(':file').trigger('click'), 0);
      };

      function exportSequence() {
        const clone = _.cloneDeep($scope.sequence);
        delete clone.result;
        delete clone.__v;
        util.depure(clone.items);
        clone.items.forEach((i) => {
          util.depure(i.headers);
          util.depure(i.keepers);
          util.depure(i.data);
        });
        util.depure(clone.parameters);
        delete clone.owner;
        util.depure(clone);
        const json = JSON.stringify(clone, null, 2);
        const data = new Blob([json], { type: 'text/plain;charset=utf-8' });
        saveAs(data, clone.title+'.json');
      }

      $scope.parameterTypes = [
        {desc:'Standard', value:''},
        {desc:'Password', value:'password'}];

      $scope.buttons = [{
        icon: 'fa-eraser',
        action: clearResult,
        tooltip: 'Clear results',
        isactive() {
          return $scope.sequence && $scope.sequence.result;
        }
      }, {
        icon: 'fa-times',
        action: $scope.closeSequence,
        tooltip: 'Close current sequence',
        isactive() {
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
        isactive() {
          return $scope.modified && $scope.sequence;
        }
      }, {
        icon: 'fa-trash',
        action: $scope.deleteSequence,
        tooltip: 'Delete current sequence'
      }];

      function removeSequence(id) {
        const result = $.grep($scope.sequences, (s) => s._id === id);
        if (!result || result.length <= 0) {return;}
        const index = $scope.sequences.indexOf(result[0]);
        $scope.sequences.splice(index, 1);
      }


      function refreshAllSequences(cb) {
        $http.get('/api/sequence')
          .then((resp) => $scope.sequences = resp.data, (err) => Logger.error('Error loading sequences', JSON.stringify(err)))
          .finally(() => {if (cb) {cb();}})
      }

      function reload(id) {
        refreshAllSequences(() => {
          $scope.sequence = null;
          const seq = _.find($scope.sequences, (s) => s._id === id);
          if (seq) {$scope.open(seq);}
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
          .then(() => Logger.ok('Star updated'), (err) => Logger.error('Error star sequence', JSON.stringify(err)));
      };

      const modalSaveChanges = Modal.confirm.ask(function (seq, cb, res) {
        if (res === 'no') {return refreshAllSequences(cb);}
        $http.put('/api/sequence/' + seq._id, seq)
          .then(() => {
            Logger.ok('Sequence "' + seq.title + '" updated!');
            reload(seq._id);
            cb();
          }, (err) => Logger.error('Error updating sequence', JSON.stringify(err)));
      });

      function checkToUpdateSequence(cb) {
        if (!$scope.modified || !$scope.sequence) {return cb();}
        const seq = $scope.sequence;
        const opt = Modal.confirm.getAskOptions(Modal.MODAL_YESNOCANCEL);
        opt.title = 'Save Changes';
        opt.body = '<p>The sequence <strong>' + seq.title + '</strong> has been changed. Do you want to save it before closing?</p>';
        modalSaveChanges(opt, seq, cb);
      }

      function refreshJSUtil(focus) {
        $timeout(() => {
          if ($scope.editor && ($scope.jsutil || $scope.sequence.jsutil)) {
            $scope.editor.refresh();
            if (focus) {$scope.editor.focus();}
          }
        }, 250);
      }

      $scope.activateJSUtil = function() {
        $scope.jsutil = true;
        refreshJSUtil(true);
      };

      $scope.open = function (raw) {
        if ($scope.sequence && raw._id === $scope.sequence._id) {return;}
        checkToUpdateSequence(() => {
          $scope.sequence = new Sequence(raw);
          $scope.address = getSequenceAddress();
          notifyModifies(false);
          $scope.closeOverlay();
          $scope.menuActive = false;
          $scope.jsutil = false;
          refreshJSUtil();
        });
      };

      $scope.addParameter = function () {
        if (!$scope.sequence) {return;}
        $scope.sequence.parameters.push(new Parameter());
        notifyModifies();
      };

      $scope.removeParameter = function (index) {
        if (!$scope.sequence) {return;}
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

      const modalPublish = Modal.confirm.ask(function () {
        $http.get('/api/sequence/publish/'+$scope.sequence._id)
          .then(() => reload($scope.sequence._id), (err) => Logger.error('Error on publish sequence', JSON.stringify(err)));
      });

      $scope.publish = function() {
        const opt = Modal.confirm.getAskOptions(Modal.MODAL_PUBLISH, $scope.sequence.title);
        modalPublish(opt);
      };



      var modalDeleteRelease = Modal.confirm.ask(function (obj) {
        $http.delete('/api/sequence/'+obj.rel._id)
          .then(() => {
            Logger.info('Release Deleted', 'Release v.'+obj.rel.version+' deleted successfully');
            obj.cb();
          }, (err) => Logger.error('Error on deleting release', JSON.stringify(err)));
      });

      $scope.manageReleases = function() {
        function loadReleases(o) {
          o.loading = true;
          $http.get('/api/sequence/releases/'+$scope.sequence._id)
            .then((resp) => o.releases = resp.data, (err) => o.error = JSON.stringify(err))
            .finally(() => o.loading = false)
        }
        $scope.overpage = {
          template: 'app/overpages/overpage-releases.html',
          loading: true,
          releases: [],
          title: 'Releases of ' + $scope.sequence.title,
          remove(rel) {
            const self = this;
            const opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, 'version ' + rel.version);
            const obj = {
              rel: rel,
              cb() { loadReleases(self); }
            };
            modalDeleteRelease(opt, obj);
          }
        };
        loadReleases($scope.overpage);
      };

      $rootScope.$on('NEW-SEQUENCE-ITEM-REQUEST',(e, data) => $scope.newSequenceItem((data||{}).index));

      $rootScope.$on('REMOVE-SEQUENCE-ITEM', (e, data) => util.remove($scope.sequence.items, (data||{}).item, notifyModifies));

      $rootScope.$on('REMOVE-SEQUENCE-ITEM-KEEPER', (e, data) => util.remove(((data||{}).item||{}).keepers, (data||{}).keeper, notifyModifies));

      $rootScope.$on('SEQUENCE-TEST-REFRESH', () => $scope.runTest());

      $rootScope.$on('SEQUENCE-ITEM-AS-LAST', (e, data) => {
        if ((data||{}).item) {
          let found = false;
          $scope.sequence.items.forEach((i) => {
            i.skip = found;
            if (i === data.item) {found = true;}
          });
        }
      });

      $scope.$watch('overpage', () => $rootScope.overpageOn = !!$scope.overpage);

      refreshAllSequences();
    }]);
