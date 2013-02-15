/*jshint camelcase:false */

/**
 * Copyright 2012 Thanasis Polychronakis. Some Rights Reserved.
 *
 * =======================
 *
 * closureCompiler.js Combines and optionally compiles javascript files
 *
 */

/**
 * The closureCompiler grunt task
 *
 */

var cCompiler   = require('./libCompiler'),
    cHelpers    = require('./helpers.js');

module.exports = function( grunt ) {
  grunt.registerMultiTask('closureCompiler', 'Google Closure Library compiler', function() {
    // Tell grunt this task is asynchronous.
    var compileDone = this.async();

    var options = this.options();

    if ( !cCompiler.validate(options) ) {
      grunt.log.error('closureCompiler Task Failed');
      return;
    }

    // Iterate over all specified file groups.
    var commands = [], cmd,
        targetName = this.target;

    this.files.forEach(function(fileObj) {

      cmd = cCompiler.compileCommand( options, fileObj );

      if ( cmd ) {
        commands.push( {cmd: cmd, dest: targetName} );
      } else {
        grunt.log.error( 'FAILED to create command line for target: ' + targetName.red );
      }
    });

    if ( 0 === commands.length ) {
      grunt.log.error('No commands produced for shell execution. Check your config file');
      compileDone(false);
      return;
    }

    // release the kraken!
    cHelpers.runCommands( commands, compileDone );

  });
};
