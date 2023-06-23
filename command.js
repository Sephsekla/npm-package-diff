#!/usr/bin/env node
var spawnSync = require('node:child_process').spawnSync;
var parsedArgs = require('minimist');
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
    var command = executeStep('git', ['show', "".concat(base, ":package-lock.json")]);
    return JSON.parse(command);
};
var run = function () {
    var _a, _b;
    var args = parsedArgs(process.argv.slice(2));
    var base = (_b = (_a = args.base) !== null && _a !== void 0 ? _a : args.b) !== null && _b !== void 0 ? _b : 'HEAD';
    var baselineLockfile = getBaseLineLockfile(base);
    console.log(baselineLockfile);
};
run();
