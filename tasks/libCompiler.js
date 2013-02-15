

var fs = require('fs'),
    path = require('path'),
    gruntMod = require('grunt'),
    helpers = require('./helpers');


var compiler = {};


/**
 * Perform validations for given options
 *
 * @return {boolean} boolean.
 * @throws {Error} If errors are found.
 */
compiler.validate = function validate( options )
{
  // check for closure compiler file
  var compilerJar = options.compilerFile;

  //
  // check compilerJar's existence
  //
  if (!gruntMod.file.exists( compilerJar )) {
    helpers.log.error('compiler Jar file path not valid: ' + compilerJar.red);
    return false;
  }

  return true;

};


/**
 * Prepare and compile the compiler command we will execute
 *
 * @param {Object} options The options.
 * @return {string|boolean} boolean false if we failed,
 *   command string if all ok.
 */
compiler.compileCommand = function compileCommand( options, fileObj ) {

  var cmd = 'java -jar ' + options.compilerFile + ' ';

  //
  // check for js files
  //
  var src = gruntMod.file.expand({nonull: true}, fileObj.src);
  if (0 < src.length) {
    cmd += helpers.makeParam(src, '--js');
  }

  //
  // Process output file
  //
  var dest = fileObj.dest;
  if('string' === typeof(dest)) {
    dest = gruntMod.template.process(dest);
  }

  // check if output file is defined
  if (dest && dest.length) {

    // create the directories if not there already
    gruntMod.file.mkdir(path.dirname( dest ));

    // if we want to check the source files timestamps enter this loop.
    if (options.checkModified && path.existsSync( dest )) {
        var doCompile = false;
        var outMtime = fs.lstatSync( dest ).mtime;

        for(var i = 0, len = src.length ; i < len ; i++) {
            if ( fs.lstatSync( src[i] ).mtime > outMtime ) {
                doCompile = true;
                break;
            }
        }
        if (!doCompile) {
            helpers.log.info('Skipping ' + src.blue + ' (Not modified)');
            return false;
        }
    }

    cmd += ' --js_output_file=' + dest;
  }

  //
  // start digging on compiler options
  //

  // create an options object if it's not there
  var opts = options.compilerOpts || {};

  for(var directive in opts) {

    // look for 'externs' special case
    if ('externs' === directive) {
      opts[directive] = gruntMod.file.expand( opts[directive] );
    }

    cmd += helpers.makeParam( opts[directive], '--' + directive );
  }


  return cmd;

};

module.exports = compiler;
