/* Created by Leo on 03/05/2016. */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ReleaseSchema = new Schema({
  _id: String,
  title: String,
  desc: String,
  version: Number,
  sequence: Schema.Types.Mixed
},{ versionKey: false });

module.exports = mongoose.model('Release', ReleaseSchema);
