'use strict';

// Pass a separate project containing grunt and grunt-symbolic-link.
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

var project = path.resolve(process.argv[2] || '.');
var gruntBin = require.resolve('grunt/bin/grunt', { paths: [project] });
var symbolicTasks = path.join(path.dirname(require.resolve('grunt-symbolic-link/package.json', { paths: [project] })), 'tasks');
var pluginTasks = path.resolve(__dirname, '../tasks');
var fixture = fs.mkdtempSync(path.join(project, 'bulk-symlink-fixture-'));

try {
  fs.mkdirSync(path.join(fixture, 'source/assets'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'source/example.txt'), 'file content');
  fs.writeFileSync(path.join(fixture, 'source/assets/nested.txt'), 'nested content');
  fs.mkdirSync(path.join(fixture, 'output'));
  fs.mkdirSync(path.join(fixture, 'output-with-slash'));
  var targets = [path.join(fixture, 'source/example.txt'), path.join(fixture, 'source/assets') + '/'];
  var config = {
    bulkSymlink: {
      withoutSlash: { targets: targets, dir: 'output' },
      withSlash: { targets: targets, dir: 'output-with-slash/' }
    }
  };
  fs.writeFileSync(path.join(fixture, 'Gruntfile.js'),
    'module.exports = function (grunt) {\n' +
    'var config = ' + JSON.stringify(config) + ';\n' +
    'config.symlink = { bulkSymlink: { target: grunt.option("bulkSymlinkTarget"), link: grunt.option("bulkSymlinkLink") } };\n' +
    'grunt.initConfig(config);\n' +
    'var spawn = grunt.util.spawn; grunt.util.spawn = function (options, done) { return spawn(options, function (error, result, code) { if (error) console.error(String(result)); done(error, result, code); }); };\n' +
    'grunt.loadTasks(' + JSON.stringify(symbolicTasks) + ');\n' +
    'grunt.loadTasks(' + JSON.stringify(pluginTasks) + ');\n' +
    '};\n');
  var result = spawnSync(process.execPath, [gruntBin, 'bulkSymlink', '--no-color'], {
    cwd: fixture, encoding: 'utf8',
    env: Object.assign({}, process.env, {
      PATH: path.join(project, 'node_modules/.bin') + path.delimiter + process.env.PATH
    })
  });
  if (result.error) throw result.error;
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  ['output', 'output-with-slash'].forEach(function (directory) {
    var file = path.join(fixture, directory, 'example.txt');
    var assets = path.join(fixture, directory, 'assets');
    assert.ok(fs.lstatSync(file).isSymbolicLink());
    assert.ok(fs.lstatSync(assets).isSymbolicLink());
    assert.strictEqual(fs.realpathSync(file), path.join(fixture, 'source/example.txt'));
    assert.strictEqual(fs.realpathSync(assets), path.join(fixture, 'source/assets'));
    assert.strictEqual(fs.readFileSync(file, 'utf8'), 'file content');
    assert.strictEqual(fs.readFileSync(path.join(assets, 'nested.txt'), 'utf8'), 'nested content');
  });
  console.log('bulkSymlink: actual file and directory links passed');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
