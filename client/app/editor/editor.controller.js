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

      $scope.toggleDebug = function () {
        $scope.debug = !$scope.debug;
      };

      function notifyModifies(modified) {
        $scope.modified = modified == undefined ? true : modified;
      }

      function getSequenceAddress() {
        return $scope.sequence ? "https://jsonizer.herokuapp.com/jsonize/" + $scope.sequence._id : '<undefined>';
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
          .success(function () {
            removeSequence(seq._id)
            $scope.sequence = undefined;
            refreshAllSequences();
            Logger.ok('Sequence "' + seq.title + '" deleted!');
          })
          .error(function (err) {
            Logger.error("Error deleting sequence", JSON.stringify(err));
          });
      });

      $scope.deleteSequence = function () {
        var opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, $scope.sequence.title);
        modalDelete(opt, $scope.sequence);
      };

      /**
       * Esegue la sequenza
       */
      $scope.play = function () {
        $scope.overpage = {
          template: 'app/editor/overpage-play.html',
          running: true,
          title: $scope.sequence.title
        };
        $http.post('/api/sequence/play', $scope.sequence)
          .success(function (result) {
            $scope.overpage.running = false;
            $scope.overpage.result = 'Sequence OK!';
            $scope.overpage.content = result.data;
            $scope.sequence.result = result;
          })
          .error(function (err) {
            $scope.overpage.running = false;
            $scope.overpage.result = 'Errors!';
            $scope.overpage.error = JSON.stringify(err);
          });
      };

      var modalParameters = Modal.confirm.parameters(function (info) {
        $scope.play();
      });

      $scope.checkPlay = function() {
        var ps = _.filter($scope.sequence.parameters, function(p) {
          return !p.hidden;
        });
        if (ps.length>0) {
          modalParameters(ps);
        } else {
          $scope.play();
        }
      };

      $scope.save = function () {
        var seq = $scope.sequence;
        if (!seq || !$scope.modified) return;
        $http.put('/api/sequence/' + seq._id, seq)
          .success(function () {
            notifyModifies(false);
            Logger.ok('Sequence ' + seq.title + ' updated');
            refreshDocument(seq._id);
          })
          .error(function (err) {
            Logger.error('Error updating sequence ' + seq.title, JSON.stringify(err));
          });
      };

      $scope.closeOverlay = function () {
        $scope.overpage = undefined;
      };

      var modalCreate = Modal.confirm.create(function (seqinfo) {
        $http.post('/api/sequence', seqinfo)
          .success(function (seq) {
            refreshAllSequences();
            $scope.open(seq);
          })
          .error(function (err) {
            Logger.error("Error creating new sequence", JSON.stringify(err));
          });
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

      $scope.buttons = [{
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
        icon: 'fa-save',
        action: $scope.save,
        tooltip: 'Save current sequence',
        isactive: function () {
          return $scope.modified && $scope.sequence;
        }
      }, {
        icon: 'fa-bolt', //'fa-play-circle',
        action: $scope.checkPlay,
        tooltip: 'Test current sequence'
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

      function refreshDocument(id) {
        var result = $.grep($scope.sequences, function (s) {
          return s._id == id;
        });
        if (!result || result.length <= 0) return;
        var index = $scope.sequences.indexOf(result[0]);
        $http.get('/api/sequence/' + id)
          .success(function (seq) {
            $scope.sequences[index] = seq;
          })
          .error(function (err) {
            Logger.error('Error loading sequence', JSON.stringify(err));
          });
      }

      function refreshAllSequences() {
        $http.get('/api/sequence')
          .success(function (sequences) {
            $scope.sequences = sequences;
          })
          .error(function (err) {
            Logger.error('Error loading sequences', JSON.stringify(err));
          });
      }

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
          .success(function () {
            Logger.ok('Star updated');
          })
          .error(function (err) {
            Logger.error('Error star sequence', JSON.stringify(err));
          });
      };

      var modalSaveChanges = Modal.confirm.ask(function (seq, cb, res) {
        if (res == 'no') {
          refreshDocument(seq._id);
          return cb();
        }
        $http.put('/api/sequence/' + seq._id, seq)
          .success(function () {
            Logger.ok('Sequence "' + seq.title + '" updated!');
            refreshDocument(seq._id);
            cb();
          })
          .error(function (err) {
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

      $scope.open = function (raw) {
        if ($scope.sequence && raw._id == $scope.sequence._id) return;
        checkToUpdateSequence(function () {
          $scope.sequence = new Sequence(raw);
          $scope.address = getSequenceAddress();
          notifyModifies(false);
          $scope.closeOverlay();
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
      };



      $scope.$on('MODIFIED', function () {
        notifyModifies();
      });

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

      $rootScope.$on('SEQUENCE-ITEM-AS-LAST', function(e, data) {
        if (data && data.item) {
          var found = false;
          $scope.sequence.items.forEach(function (i) {
            i.skip = found;
            if (i === data.item) found = true;
          });
        }
      });



      refreshAllSequences();
    }]);
