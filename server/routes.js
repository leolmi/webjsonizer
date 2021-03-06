'use strict';

const errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/sequence', require('./api/sequence'));
  app.use('/auth', require('./auth'));
  app.use('/jsonize', require('./jsonize'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => res.sendfile(app.get('appPath') + '/index.html'));
};
