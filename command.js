#!/usr/bin/env node
var readFileSync = require('fs').readFileSync;
var parsedArgs = require('minimist');
var spawnSync = require('node:child_process').spawnSync;
var join = require('node:path').join;
;
var executeStep = function (cmd, args) {
    var command = spawnSync(cmd, args, { encoding: 'utf-8' });
    if (command.status > 0) {
        console.error(command.stderr);
        process.exit(1);
    }
    return command.stdout;
};
var getBaseLineLockfile = function (base) {
    var file = executeStep('git', ['show', "".concat(base, ":package-lock.json")]);
    return JSON.parse(file);
};
var getCurrentLockfile = function () {
    try {
        var data = readFileSync(join(process.cwd(), 'package-lock.json'), 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
var run = function () {
    var _a, _b;
    var args = parsedArgs(process.argv.slice(2));
    var base = (_b = (_a = args.base) !== null && _a !== void 0 ? _a : args.b) !== null && _b !== void 0 ? _b : 'HEAD';
    var baselineLockfile = getBaseLineLockfile(base);
    var currentLockfile = getCurrentLockfile();
    console.log(currentLockfile);
};
run();
