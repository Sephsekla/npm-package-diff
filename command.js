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
    var packageChanges = {};
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
        var packageNiceName = package.replace('node_modules/', '');
        if (!prevVersion) {
            packageChanges[packageNiceName] = {
                'operation': 'install',
                'newVersion': newVersion,
            };
            return;
        }
        if (!newVersion) {
            packageChanges[packageNiceName] = {
                'operation': 'uninstall',
                'prevVersion': prevVersion,
            };
            return;
        }
        if (prevVersion < newVersion) {
            packageChanges[packageNiceName] = {
                'operation': 'update',
                'prevVersion': prevVersion,
                'newVersion': newVersion,
            };
            return;
        }
        if (prevVersion > newVersion) {
            packageChanges[packageNiceName] = {
                'operation': 'downgrade',
                'prevVersion': prevVersion,
                'newVersion': newVersion,
            };
            return;
        }
        packageChanges[packageNiceName] = {
            'operation': 'change',
            'prevVersion': prevVersion,
            'newVersion': newVersion,
        };
    });
    return packageChanges;
};
var printMarkdown = function (packageChanges) {
    var packageArray = Object.entries(packageChanges);
    for (var _i = 0, packageArray_1 = packageArray; _i < packageArray_1.length; _i++) {
        var _a = packageArray_1[_i], package = _a[0], data = _a[1];
        var prevVersion = data.prevVersion, newVersion = data.newVersion, operation = data.operation;
        switch (operation) {
            case 'install':
                console.log("- Installed ".concat(package, "[").concat(newVersion, "]"));
                break;
            case 'uninstall':
                console.log("- Uninstalled ".concat(package, " [").concat(prevVersion, "]"));
                break;
            case 'update':
                console.log("- Updated ".concat(package, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
                break;
            case 'downgrade':
                console.log("- Downgraded ".concat(package, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
                break;
            default:
                console.log("- Changed ".concat(package, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
        }
    }
};
var run = function () {
    var _a, _b, _c, _d;
    var args = parsedArgs(process.argv.slice(2));
    var base = (_b = (_a = args.base) !== null && _a !== void 0 ? _a : args.b) !== null && _b !== void 0 ? _b : 'HEAD';
    var format = (_d = (_c = args.format) !== null && _c !== void 0 ? _c : args.f) !== null && _d !== void 0 ? _d : 'markdown';
    var baselineLockfile = getBaselineLockfile(base);
    var currentLockfile = getCurrentLockfile();
    var packageChanges = diffPackages(baselineLockfile, currentLockfile);
    if (format === 'json') {
        console.log(JSON.stringify(packageChanges));
        return;
    }
    if (format === 'markdown' || format === 'md') {
        printMarkdown(packageChanges);
        return;
    }
    console.log(packageChanges);
};
run();
