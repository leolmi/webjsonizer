/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SequenceJSSchema = new Schema({
  id: String,         // identificativo
  target: String,     // parametro target
  sourceType: String, // tipo di risorsa
  name: String,       // nome property
  logic: String,      // logica
  logicType: String   // tipo logica (none, javascript, regex)
});

var NameValueSchema = new Schema({
  id: String,
  name: String,
  value: String,
  hidden: Boolean,
  logicType: String
});

var SequenceItemSchema = new Schema({
  title: String,
  skip: Boolean,
  host: String,
  method: String,
  path: String,
  referer: String,  //se='auto' viene preso il precedente path
  data: [NameValueSchema],
  datatype: String,
  headers: [NameValueSchema],
  keepers: [SequenceJSSchema]
});

var SequenceSchema = new Schema({
  title: String,
  desc: String,
  enabled: Boolean,
  vote: [String],
  version: Number,
  SSL: Boolean,
  GET: Boolean,
  proxy: Boolean,
  owner: String,
  star: Boolean,
  result: Schema.Types.Mixed,
  parameters: [NameValueSchema],
  items: [SequenceItemSchema],
  parserOptions: Schema.Types.Mixed,
  jsutil: String
},{ versionKey: false });

module.exports = mongoose.model('Sequence', SequenceSchema);
