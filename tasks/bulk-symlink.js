/*
 * grunt-bulk-symlink
 * https://github.com/memolog/grunt-bulk-symlink
 *
 * Copyright (c) 2013 Yutaka Yamaguchi
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  'use strict';

  grunt.registerMultiTask('bulkSymlink', 'execute symlink task repeatedly', function () {
    var cb = this.async();

    var files = this.data.targets;
    var dir = this.data.dir;
    grunt.util.async.forEachSeries(files, function (file, next) {
      var filename = file.replace(/\/$/, '');
      filename = filename.substr(filename.lastIndexOf('/') + 1);

      grunt.util.spawn({
        grunt: true,
        args: ['symlink:bulkSymlink', '--bulkSymlinkTarget', file, '--bulkSymlinkLink', dir + filename]
      }, function (error, result, code) {
        if (!error) {
          if (result) {
            grunt.log.ok('symlink ' + file + ' to ' + dir + filename + '\n');
          } else {
            grunt.warn('got no result from ' + file + '(' + code + ')\n');
          }
        } else {
          grunt.log.write('error (' + code + ')\n');
          grunt.warn(error);
        }
        next(error);
      });
    }, cb);
  });
};