'use strict';

var assert = require('assert');
var register = require('../tasks/bulk-symlink');

// Exercise the task without installing Grunt or launching child processes.
async function runTask(data, spawnError) {
  var task;
  var calls = [];
  var warnings = [];
  var active = 0;
  var grunt = {
    registerMultiTask: function (name, description, handler) {
      assert.strictEqual(name, 'bulkSymlink');
      task = handler;
    },
    util: {
      async: {
        forEachSeries: function (files, iterate, done) {
          var index = 0;
          function next(error) {
            if (error || index === files.length) return done(error);
            iterate(files[index++], next);
          }
          next();
        }
      },
      spawn: function (options, callback) {
        assert.strictEqual(active, 0, 'targets must be processed sequentially');
        active++;
        calls.push(options);
        setImmediate(function () {
          active--;
          callback(spawnError, spawnError ? null : 'created', spawnError ? 1 : 0);
        });
      }
    },
    log: { ok: function () {}, write: function () {} },
    warn: function (warning) { warnings.push(warning); }
  };
  register(grunt);
  var error = await new Promise(function (resolve) {
    task.call({ data: data, async: function () { return resolve; } });
  });
  return { calls: calls, warnings: warnings, error: error };
}

async function main() {
  var result = await runTask({
    targets: ['../../foo/bar.txt', '../../bar/assets/'],
    dir: 'output'
  });
  assert.deepStrictEqual(result.calls, [
    { grunt: true, args: ['symlink:bulkSymlink', '--bulkSymlinkTarget=../../foo/bar.txt', '--bulkSymlinkLink=output/bar.txt'] },
    { grunt: true, args: ['symlink:bulkSymlink', '--bulkSymlinkTarget=../../bar/assets/', '--bulkSymlinkLink=output/assets'] }
  ]);
  assert.strictEqual(result.error, undefined);
  assert.deepStrictEqual(result.warnings, []);

  var withSlash = await runTask({ targets: ['../../foo/bar.txt', '../../bar/assets/'], dir: 'output/' });
  assert.deepStrictEqual(withSlash.calls, result.calls);

  result = await runTask({ targets: [], dir: 'output/' });
  assert.deepStrictEqual(result.calls, []);
  assert.strictEqual(result.error, undefined);

  var failure = new Error('symlink failed');
  result = await runTask({ targets: ['first.txt', 'second.txt'], dir: 'output/' }, failure);
  assert.strictEqual(result.calls.length, 1, 'stop after the first failure');
  assert.strictEqual(result.error, failure);
  assert.deepStrictEqual(result.warnings, [failure]);
  console.log('bulkSymlink: all tests passed');
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
