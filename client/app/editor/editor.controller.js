/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .controller('EditorCtrl', ['$scope','$rootScope','$http','$timeout','$location','Auth','Logger','Modal', function ($scope,$rootScope,$http,$timeout,$location,Auth,Logger,Modal) {
    $scope.sequence = undefined;
    $scope.user = Auth.getCurrentUser();
    $scope.modified = false;

    $scope.newSequence = function() {
      $http.post('/api/sequence', { title: 'New Sequence', enabled: true })
        .success(function(seq){
          $scope.refreshDocuments();
          $scope.open(seq);
        })
        .error(function(err) {
          Logger.error("Error creating new sequence", JSON.stringify(err));
        });
    };

    $scope.newSequenceItem = function () {
      var i = $scope.sequence.items;
      var last = i.length>0 ? i[i.length-1] : undefined;
      $scope.sequence.items.push({
        title: 'New Item',
        host: last ? last.host : '',
        method: 'get',
        path: '',
        referer: 'auto',
        data: '',
        prevalidations: [],
        postvalidations: [],
        headers: []
      });
      $scope.modified = true;
      $timeout(function () {
        $scope.$broadcast('open-item', {item: i[i.length - 1]});
      }, 30);
    };

    var modalDelete = Modal.confirm.ask(function(seq) {
      $http.delete('/api/sequence/'+seq._id)
        .success(function(){
          $scope.sequence = undefined;
          $scope.refreshDocuments();
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
      $http.post('/api/sequence/'+$scope.sequence._id)
        .success(function() {
          Logger.ok('Sequence OK!');
        })
        .error(function(err){
          Logger.error('Error running sequences', JSON.stringify(err));
        });
    };

    $scope.buttons = [{
      icon:'fa-play-circle',
      action: $scope.play,
      tooltip:'Test current sequence'
    },{
      icon:'fa-plus-circle',
      action: $scope.newSequence,
      tooltip:'Create new sequence'
    },{
      icon:'fa-trash',
      action: $scope.deleteSequence,
      tooltip:'Delete current sequence'
    }];


    $scope.refreshDocuments = function() {
      $http.get('/api/sequence')
        .success(function(sequences){
          $scope.sequences = sequences;
        })
        .error(function(err){
          Logger.error('Error loading sequences', JSON.stringify(err));
        });
    };

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

    var modalSaveChanges = Modal.confirm.ask(function(seq, cb, result) {
      if (result=='no') {
        $scope.refreshDocuments();
        return cb();
      }
      $http.put('/api/sequence/'+seq._id, seq)
        .success(function(){
          Logger.ok('Sequence "'+seq.title+'" updated!');
          cb();
        })
        .error(function(err) {
          Logger.error("Error deleting sequence", JSON.stringify(err));
        });
    });

    function checkToUpdateSequence(cb) {
      if (!$scope.modified) return cb();
      var opt = Modal.confirm.getAskOptions(Modal.MODAL_YESNOCANCEL);
      opt.title = 'Save Changes';
      opt.body = '<p>Sequence <strong>'+$scope.sequence.title+'</strong> was modified, want to save it before close?</p>';
      modalSaveChanges(opt, $scope.sequence, cb);
    }

    $scope.open = function(sequence) {
      if ($scope.sequence && sequence._id==$scope.sequence._id) return;
      checkToUpdateSequence(function() {
        $scope.sequence = sequence;
        $scope.modified = false
      })
    };

    $scope.refreshDocuments();
  }]);
