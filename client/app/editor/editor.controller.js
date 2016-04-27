/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('EditorCtrl', ['$scope','$rootScope','$http','$timeout','$location','Auth','Logger','Modal', function ($scope,$rootScope,$http,$timeout,$location,Auth,Logger,Modal) {
    $scope.sequence = undefined;
    $scope.user = Auth.getCurrentUser();
    $scope.modified = false;
    $scope.debug = false;

    //$scope.newSequence = function() {
    //  $http.post('/api/sequence', { title: 'New Sequence', enabled: true })
    //    .success(function(seq){
    //      refreshAllSequences();
    //      $scope.open(seq);
    //    })
    //    .error(function(err) {
    //      Logger.error("Error creating new sequence", JSON.stringify(err));
    //    });
    //};

    $scope.toggleDebug = function() {
      $scope.debug = !$scope.debug;
    };

    function notifyModifies(modified){
      $scope.modified = modified==undefined ? true : modified;
    }

    function getSequenceAddress() {
      return $scope.sequence ? "https://jsonizer.herokuapp.com/jsonize/"+$scope.sequence._id : '<undefined>';
    }

    $scope.newSequenceItem = function (index) {
      var i = $scope.sequence.items;
      index = index==undefined ? i.length : index;
      var prev = index>0 ? i[index-1] : undefined;

      $scope.sequence.items.splice(index, 0, {
        title: 'New Item',
        host: prev ? prev.host : '',
        method: 'get',
        path: '',
        referer: 'auto',
        data: '',
        prejs: [],
        postjs: [],
        headers: [],
        selector:''
      });
      notifyModifies();
      $timeout(function () {
        $scope.$broadcast('open-item', {item: i[index]});
      }, 30);
    };

    $scope.removeItem = function(index) {
      $scope.sequence.items.splice(index,1);
      notifyModifies();
    };

    var modalDelete = Modal.confirm.ask(function(seq) {
      $http.delete('/api/sequence/'+seq._id)
        .success(function(){
          removeSequence(seq._id)
          $scope.sequence = undefined;
          refreshAllSequences();
          Logger.ok('Sequence "'+seq.title+'" deleted!');
        })
        .error(function(err) {
          Logger.error("Error deleting sequence", JSON.stringify(err));
        });
    });

    $scope.deleteSequence = function() {
      var opt = Modal.confirm.getAskOptions(Modal.MODAL_DELETE, $scope.sequence.title);
      modalDelete(opt, $scope.sequence);
    };

    /**
     * Esegue la sequenza
     */
    $scope.play = function() {
      $scope.overpage = {
        template: 'app/editor/overpage-play.html',
        running: true,
        title: $scope.sequence.title
      };
      $http.post('/api/sequence/play', $scope.sequence)
        .success(function(result) {
          $scope.overpage.running = false;
          $scope.overpage.result = 'Sequence OK!';
          $scope.overpage.content = result.data;
          $scope.sequence.result = result;
        })
        .error(function(err){
          $scope.overpage.running = false;
          $scope.overpage.result = 'Errors!';
          $scope.overpage.error = JSON.stringify(err);
        });
    };

    $scope.save = function() {
      var seq = $scope.sequence;
      if (!seq || !$scope.modified) return;
      $http.put('/api/sequence/'+seq._id, seq)
        .success(function(){
          notifyModifies(false);
          Logger.ok('Sequence '+seq.title+' updated');
          refreshDocument(seq._id);
        })
        .error(function(err){
          Logger.error('Error updating sequence '+seq.title, JSON.stringify(err));
        });
    };

    $scope.closeOverlay = function() {
      $scope.overpage = undefined;
    };

    var modalCreate = Modal.confirm.create(function(seqinfo) {
      $http.post('/api/sequence', seqinfo)
        .success(function(seq){
          refreshAllSequences();
          $scope.open(seq);
        })
        .error(function(err) {
          Logger.error("Error creating new sequence", JSON.stringify(err));
        });
    });

    $scope.newSequence = function() {
      var info = {
        title: 'New Sequence',
        selector: '$(\'#TABLEID\')',
        items: []
      };
      modalCreate(info);
    };

    $scope.closeSequence = function() {
      checkToUpdateSequence(function() {
        $scope.sequence = undefined;
      });
    };

    $scope.buttons = [{
      icon:'fa-times',
      action: $scope.closeSequence,
      tooltip:'Close current sequence',
      isactive: function() { return $scope.sequence; }
    },{
      icon:'fa-magic',
      action: $scope.newSequence,
      tooltip:'Build new sequence'
    },{
      separator: true
    },{
      icon:'fa-save',
      action: $scope.save,
      tooltip:'Save current sequence',
      isactive: function() { return $scope.modified && $scope.sequence; }
    },{
      icon: 'fa-bolt', //'fa-play-circle',
      action: $scope.play,
      tooltip:'Test current sequence'
    },{
      icon:'fa-trash',
      action: $scope.deleteSequence,
      tooltip:'Delete current sequence'
    }];

    function removeSequence(id) {
      var result = $.grep($scope.sequences, function(s){ return s._id==id; });
      if (!result || result.length<=0) return;
      var index = $scope.sequences.indexOf(result[0]);
      $scope.sequences.splice(index, 1);
    }

    function refreshDocument(id){
      var result = $.grep($scope.sequences, function(s){ return s._id==id; });
      if (!result || result.length<=0) return;
      var index = $scope.sequences.indexOf(result[0]);
      $http.get('/api/sequence/'+id)
        .success(function(seq){
          $scope.sequences[index] = seq;
        })
        .error(function(err){
          Logger.error('Error loading sequence', JSON.stringify(err));
        });
    }
    function refreshAllSequences() {
      $http.get('/api/sequence')
        .success(function(sequences){
          $scope.sequences = sequences;
        })
        .error(function(err){
          Logger.error('Error loading sequences', JSON.stringify(err));
        });
    }

    $scope.logout = function() {
      $rootScope.user = {};
      Auth.logout();
      $location.path('/');
    };

    /**
     * toggle star from sequence
     * @param e
     * @param sequence
     */
    $scope.star = function(e, sequence) {
      e.preventDefault();
      e.stopPropagation();
      sequence.star = !sequence.star;
      $http.post('/api/sequence/star', sequence)
        .success(function(){
          Logger.ok('Star updated');
        })
        .error(function(err){
          Logger.error('Error star sequence', JSON.stringify(err));
        });
    };

    var modalSaveChanges = Modal.confirm.ask(function(seq, cb, res) {
      if (res=='no') {
        refreshDocument(seq._id);
        return cb();
      }
      $http.put('/api/sequence/'+seq._id, seq)
        .success(function(){
          Logger.ok('Sequence "'+seq.title+'" updated!');
          refreshDocument(seq._id);
          cb();
        })
        .error(function(err) {
          Logger.error("Error updating sequence", JSON.stringify(err));
        });
    });

    function checkToUpdateSequence(cb) {
      if (!$scope.modified || !$scope.sequence) return cb();
      var seq = $scope.sequence;
      var opt = Modal.confirm.getAskOptions(Modal.MODAL_YESNOCANCEL);
      opt.title = 'Save Changes';
      opt.body = '<p>The sequence <strong>'+seq.title+'</strong> has been changed. Do you want to save it before closing?</p>';
      modalSaveChanges(opt, seq, cb);
    }

    $scope.open = function(sequence) {
      if ($scope.sequence && sequence._id==$scope.sequence._id) return;
      checkToUpdateSequence(function() {
        $scope.sequence = sequence;
        $scope.address = getSequenceAddress();
        notifyModifies(false);
      })
    };

    $scope.addParameter = function() {
      if (!$scope.sequence) return;
      $scope.sequence.parameters.push({name:'',value:'',hidden:false});
      notifyModifies();
    };

    $scope.removeParameter = function(index) {
      if (!$scope.sequence) return;
      $scope.sequence.parameters.splice(index,1);
      notifyModifies();
    };

    $scope.changed = function() { notifyModifies(); };

    $scope.togglePublic = function(p) {
      p.hidden = !p.hidden;
      notifyModifies();
    };

    $scope.$on('MODIFIED', function() { notifyModifies(); });

    var modalTest = Modal.confirm.test(function(info) {
      $scope.sequence.selector = info.pattern;
    });
    $scope.test = function() {
      var info = {
        html: $scope.sequence.result ? $scope.sequence.result.content : '',
        pattern: $scope.sequence.selector,
        width: '80%'
      };
      modalTest(info);
    };




    refreshAllSequences();
  }]);
