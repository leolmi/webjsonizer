/* Created by Leo on 28/04/2016. */
'use strict';

angular.module('webjsonizerApp')
  .factory('URL',[function(){
    var PATH_MATCH = /^([^\?#]*)(\?(.*))?$/;
    var urlParsingNode = window.document.createElement("a");
    var msie = window.document.documentMode;

    var URL = function(url) {
      this.url = decodeURIComponent(url);
      if (this.url) {
        var href = this.url;
        if (msie) {
          urlParsingNode.setAttribute("href", href);
          href = urlParsingNode.href;
        }
        urlParsingNode.setAttribute('href', href);

        this.protocol = urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '';
        this.host = urlParsingNode.host;
        this.search = urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '';
        this.hash = urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '';
        this.hostname = urlParsingNode.hostname;
        this.port = urlParsingNode.port;
        this.pathname = (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname;
        this.pathsearchname = (this.search) ? this.pathname + '?' + this.search : this.pathname;
      }
    };

    URL.prototype = {
      url: '',
      protocol: '',
      host: '',
      search: '',
      hash: '',
      hostname: '',
      port: '',
      pathname: '',
      pathsearchname: ''
    };

    return (URL);
  }]);



