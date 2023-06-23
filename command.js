#!/usr/bin/env node
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
var getBaselineLockfile = function (base) {
    var file = executeStep('git', ['show', "".concat(base, ":package-lock.json")]);
    return JSON.parse(file);
};
var getCurrentLockfile = function () {
    try {
        var file = readFileSync(join(process.cwd(), 'package-lock.json'), 'utf8');
        return JSON.parse(file);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
var diffPackages = function (baselineLockfile, currentLockfile) {
    var _a, _b;
    var baselinePackages = (_a = baselineLockfile === null || baselineLockfile === void 0 ? void 0 : baselineLockfile.packages) !== null && _a !== void 0 ? _a : {};
    var currentPackages = (_b = currentLockfile === null || currentLockfile === void 0 ? void 0 : currentLockfile.packages) !== null && _b !== void 0 ? _b : {};
    var allPackages = new Set(__spreadArray(__spreadArray([], Object.keys(currentPackages), true), Object.keys(baselinePackages), true));
    allPackages.forEach(function (package) {
        var _a, _b;
        if (!package) {
            return;
        }
        var prevVersion = (_a = baselinePackages[package]) === null || _a === void 0 ? void 0 : _a.version;
        var newVersion = (_b = currentPackages[package]) === null || _b === void 0 ? void 0 : _b.version;
        if (prevVersion === newVersion) {
            return;
        }
        if (!prevVersion) {
            console.log("Installed ".concat(package, " version ").concat(newVersion));
            return;
        }
        if (!newVersion) {
            console.log("Uninstalled ".concat(package, " version ").concat(prevVersion));
            return;
        }
        if (prevVersion < newVersion) {
            console.log("Updated ".concat(package, " from ").concat(prevVersion, " to ").concat(newVersion));
            return;
        }
        if (prevVersion > newVersion) {
            console.log("Downgraded ".concat(package, " from ").concat(prevVersion, " to ").concat(newVersion));
            return;
        }
        console.log("Changed ".concat(package, " from ").concat(prevVersion, " to ").concat(newVersion));
    });
};
var run = function () {
    var _a, _b;
    var args = parsedArgs(process.argv.slice(2));
    var base = (_b = (_a = args.base) !== null && _a !== void 0 ? _a : args.b) !== null && _b !== void 0 ? _b : 'HEAD';
    var baselineLockfile = getBaselineLockfile(base);
    var currentLockfile = getCurrentLockfile();
    diffPackages(baselineLockfile, currentLockfile);
};
run();
