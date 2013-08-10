/*
 * grunt-resizeImages
 * https://github.com/andrew/grunt-resizeImages
 *
 * Copyright (c) 2013 Andrew Mason
 * Licensed under the MIT license.
 *
 * TODO:
 *      - Create 2x versions if needed
 *      - Find a better place for fileManifest.json
 */

'use strict';
var hash_file = require('hash_file');
var easyimg = require('easyimage');

module.exports = function(grunt) {

  grunt.registerMultiTask('resizeImages', 'Your task description goes here.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      manifest: 'fileManifest.json',
      width: 700,
      quality: 80
    });

    var done = this.async();
    var fileCount = null;
    function checkIfFininshed() {
      if ( --fileCount === 0) {
        grunt.file.write(options.manifest, JSON.stringify(fileHashes));
        done();
      }
    }

    var fileHashes = {};
    if (grunt.file.exists(options.manifest)) {
      fileHashes = grunt.file.readJSON(options.manifest);
    }

    this.files.forEach(function(file) {
      var realFiles = file.src.filter(function(filepath) {
       return grunt.file.exists(filepath);
      });

      fileCount = realFiles.length;

      realFiles.map(function(filePath) {
        var destFile = file.dest + filePath.replace(/^.*[\\\/]/, '');
        hash_file(filePath, 'md5', finishedHashing);

        function finishedHashing(err, hash) {
          if (fileHashes.hasOwnProperty(filePath) && fileHashes[filePath] === hash && grunt.file.exists(destFile)) {
            checkIfFininshed();
          } else {
            processImage();
            fileHashes[filePath] = hash;
          }
        }

        function processImage() {

          grunt.file.write(destFile, null);

          easyimg.resize({
            src: filePath,
            dst: destFile,
            width: options.width,
            quality: options.quality
          }, function(err, image) {
            if (err) throw err;
            grunt.log.writeln('Created new file: ', destFile);
            checkIfFininshed();
          })
        }

      });
    });
  });
};
