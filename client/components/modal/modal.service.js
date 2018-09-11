'use strict';

angular.module('webjsonizerApp')
  .factory('Modal', function ($rootScope, $uibModal) {
    const BUTTON = {
      DELETE: 'delete',
      YESNOCANCEL: 'yesnocancel',
      PUBLISH: 'publish'
    };

    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $uibModal.open() returns
     */
    function openModal(scope, modalClass) {
      const modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $uibModal.open({
        animation: true,
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope,
        size: (scope.modal||{}).size||''
      });
    }

    // Public API here
    return {
      MODAL_DELETE: BUTTON.DELETE,
      MODAL_YESNOCANCEL: BUTTON.YESNOCANCEL,
      MODAL_PUBLISH: BUTTON.PUBLISH,
      /* Confirmation modals */
      confirm: {
        /**
         * Returns options for right ask modal form
         * @param type
         */
        getAskOptions: function(type) {
          let args = Array.prototype.slice.call(arguments);
          type = type || args.shift();
          const opt = {
            title: '',
            body: '',
            ok: 'OK',
            okClass: 'btn-warning',
            okResult: 'ok',
            cancel: 'Cancel',
            cancelClass: 'btn-default',
            no: '',
            noClass: 'btn-danger',
            noResult: 'no',
            modalClass: 'modal-warning'
          };
          switch(type) {
            case BUTTON.DELETE:
              opt.title = 'Confirm Delete';
              opt.body = '<p>Are you sure you want to delete "<strong>' + args[0] + '</strong>" ?</p>';
              opt.ok = 'Delete';
              opt.okClass = 'btn-danger';
              opt.modalClass = 'modal-danger';
              break;
            case BUTTON.PUBLISH:
              opt.title = 'Confirm Publish';
              opt.body = '<p>Are you sure you want to publish a new version of "<strong>' + args[0] + '</strong>" ?</p>';
              opt.ok = 'Publish';
              opt.okClass = 'btn-danger';
              opt.modalClass = 'modal-warning';
              break;
            case BUTTON.YESNOCANCEL:
              opt.ok = 'Yes';
              opt.no = 'No';
              break;
          }
          return opt;
        },

        /**
         * Create a function to open a generic confirmation modal (ex. ng-click='myModalFn(options, arg1, arg2...)')
         * @param  {Function} exc - callback, ran when execution is confirmed
         * @param  {Function} dsc - callback, ran when execution is discard
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        ask: function(exc, dsc) {
          exc = exc || angular.noop;
          dsc = dsc || angular.noop;

          /**
           * Open a execution confirmation modal
           * @param  options   - class of modal options
           * @param  {All}     - any additional args are passed staight to del callback
           */
          return function() {
            let args = Array.prototype.slice.call(arguments),
              options = args.shift(),
              execModal;

            const buttons = [];
            if (options.ok) {buttons.push({
                classes: options.okClass,
                text: options.ok,
                click(e) {
                  args.push(options.okResult);
                  execModal.close(e);
                }
              });}
            if (options.no) {buttons.push({
                classes: options.noClass,
                text: options.no,
                click(e) {
                  args.push(options.noResult);
                  execModal.close(e);
                }
              });}
            if (options.cancel) {buttons.push({
                classes: options.cancelClass,
                text: options.cancel,
                click(e) {
                  execModal.dismiss(e);
                }
              });}

            execModal = openModal({
              modal: {
                dismissable: true,
                title: options.title,
                html: options.body,
                buttons: buttons
              }
            }, options.modalClass);

            execModal.result.then((e) => exc.apply(e, args), (e) => dsc.apply(e, args));
          };
        },

        /**
         * Crea una nuova sequenza ...
         * @param cb
         * @returns {Function}
         */
        create: function(cb) {
          cb = cb || angular.noop;

          return function() {
            const args = Array.prototype.slice.call(arguments);
            let createModal;
            const modal = {
              info: args[0],
              dismissable: true,
              idle: false,
              title: 'Create new Sequence',
              template: 'components/modal/modal-create.html',
              buttons: [{
                classes: 'btn-success',
                text: 'Ok',
                click(e) {
                  if (_.isFunction(modal.apply)) {modal.apply();}
                  createModal.close(e);
                }
              },{
                classes: 'btn-warning',
                text: 'Cancel',
                click(e) {
                  createModal.dismiss(e);
                }
              }]
            };

            createModal = openModal({
              modal: modal
            }, 'modal-warning');

            createModal.result.then((e) => cb.apply(e, args), () => console.log('modal dismissed'));
          }
        },

        /**
         * Apre il form per il test del parser dei risultati
         * @param cb
         */
        test: function(cb) {
          cb = cb || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments);

            var testModal = openModal({
              modal: {
                test: args[0],
                dismissable: true,
                size: 'lg',
                idle: false,
                title: 'Test pattern',
                template: 'components/modal/modal-test.html',
                buttons: [{
                  classes: 'btn-success',
                  text: 'Ok',
                  click: function(e) {
                    testModal.close(e);
                  }
                },{
                  classes: 'btn-warning',
                  text: 'Cancel',
                  click: function(e) {
                    testModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-warning');

            testModal.result.then((e) => cb.apply(e, args), () => console.log('modal dismissed'));
          }
        },

        /**
         * Apre il form per la valorizzazione di N parametri
         * @param cb
         */
        parameters: function(cb) {
          cb = cb || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments);

            var parametersModal = openModal({
              modal: {
                parameters: args[0],
                dismissable: true,
                idle: false,
                title: 'Parameters',
                template: 'components/modal/modal-parameters.html',
                buttons: [{
                  classes: 'btn-success',
                  text: 'Ok',
                  click: function(e) {
                    parametersModal.close(e);
                  }
                },{
                  classes: 'btn-warning',
                  text: 'Cancel',
                  click: function(e) {
                    parametersModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-warning');

            parametersModal.result.then((e) => cb.apply(e, args), () => console.log('modal dismissed'));
          }
        }
      }
    };
  });
