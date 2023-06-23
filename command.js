#!/usr/bin/env node
var _a, _b;
var spawnSync = require('node:child_process').spawnSync;
var parsedArgs = require('minimist');
;
var executeStep = function (cmd, args) {
    var command = spawnSync(cmd, args, { encoding: 'utf-8' });
    return command.stdout;
};
var args = parsedArgs(process.argv.slice(2));
var base = (_b = (_a = args.base) !== null && _a !== void 0 ? _a : args.b) !== null && _b !== void 0 ? _b : 'HEAD';
var baselineLockfile = executeStep('git', ['show', "".concat(base, ":package-lock.json")]);
console.log(JSON.parse(baselineLockfile));
