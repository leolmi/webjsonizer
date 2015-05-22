/**
 * Created by Leo on 06/02/2015.
 */

angular.module('webjsonizerApp')
  .factory('Logger', function(toastr){
    var _settings = {
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
      if (typeof message!='string')
        return JSON.stringify(message);
      return message;
    }

    var toastOk = function(title, message){
      toastr.success(validateMessage(message), title, _settings);
    };

    var toastError = function(title, message){
      toastr.error(validateMessage(message), title, _settings);
    };

    var toastInfo = function(title, message){
      toastr.info(validateMessage(message), title, _settings);
    };

    var toastWarning = function(title, message){
      toastr.warning(validateMessage(message), title, _settings);
    };

    return {
      ok: toastOk,
      error: toastError,
      info: toastInfo,
      warning: toastWarning
    }
  });
