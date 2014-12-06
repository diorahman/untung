#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var untung = require('../remote');

program
  .version('1.0.0')
  .parse(process.argv);

untung();
