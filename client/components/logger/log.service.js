'use strict';

angular.module('webjsonizerApp')
  .factory('Logger', function(toastr){
    const _settings = {
      target: 'body',
      allowHtml: true,
      closeButton: false,
      closeHtml: '<button>&times;</button>',
      containerId: 'toast-container',
      extendedTimeOut: 1000,
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      },
      messageClass: 'toast-message',
      positionClass: 'toast-bottom-right',
      tapToDismiss: true,
      timeOut: 3000,
      titleClass: 'toast-title',
      toastClass: 'toast'
    };

    function validateMessage(message) {
      return _.isString(message) ? message : JSON.stringify(message);
    }

    const toastOk = function(title, message){
      toastr.success(validateMessage(message), title, _settings);
    };

    const toastError = function(title, message){
      toastr.error(validateMessage(message), title, _settings);
    };

    const toastInfo = function(title, message){
      toastr.info(validateMessage(message), title, _settings);
    };

    const toastWarning = function(title, message){
      toastr.warning(validateMessage(message), title, _settings);
    };

    return {
      ok: toastOk,
      error: toastError,
      info: toastInfo,
      warning: toastWarning
    }
  });
