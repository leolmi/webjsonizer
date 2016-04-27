'use strict';

var Sequence = require('../api/sequence/sequence.controller');

// Esegue la sequenza restituendo i risultati
exports.jsonize = function(req, res) {
  Sequence.milk(req, res);
};
