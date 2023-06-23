#!/usr/bin/env node
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var readFileSync = require('fs').readFileSync;
var markdown_table_1 = require("markdown-table");
var spawnSync = require('node:child_process').spawnSync;
var join = require('node:path').join;
var parseArgs = require("node:util").parseArgs;
;
var capitaliseWord = function (word) { return ("".concat(word[0].toUpperCase).concat(word.slice(1))); };
var executeStep = function (cmd, args) {
    var command = spawnSync(cmd, args, { encoding: 'utf-8' });
    if (command.status && command.status > 0) {
        console.error(command.stderr);
        process.exit(1);
    }
    return command.stdout;
};
var getBaselineLockfile = function (base) {
    var file = executeStep('git', ['show', "".concat(base, ":package-lock.json")]);
    if (typeof (file) !== 'string') {
        console.error('Could not parse base package-lock.json');
        process.exit(1);
    }
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
    allPackages.forEach(function (packageName) {
        var _a, _b;
        if (!packageName) {
            return;
        }
        var prevVersion = (_a = baselinePackages[packageName]) === null || _a === void 0 ? void 0 : _a.version;
        var newVersion = (_b = currentPackages[packageName]) === null || _b === void 0 ? void 0 : _b.version;
        if (prevVersion === newVersion) {
            return;
        }
        var packageNiceName = packageName.replace('node_modules/', '');
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
var printMarkdownList = function (packageChanges) {
    var packageArray = Object.entries(packageChanges);
    if (packageArray.length < 1) {
        return;
    }
    for (var _i = 0, packageArray_1 = packageArray; _i < packageArray_1.length; _i++) {
        var _a = packageArray_1[_i], packageName = _a[0], data = _a[1];
        var prevVersion = data.prevVersion, newVersion = data.newVersion, operation = data.operation;
        switch (operation) {
            case 'install':
                console.log("- Install ".concat(packageName, "[").concat(newVersion, "]"));
                break;
            case 'uninstall':
                console.log("- Uninstall ".concat(packageName, " [").concat(prevVersion, "]"));
                break;
            case 'update':
                console.log("- Updat ".concat(packageName, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
                break;
            case 'downgrade':
                console.log("- Downgrade ".concat(packageName, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
                break;
            default:
                console.log("- Change ".concat(packageName, " [").concat(prevVersion, " => ").concat(newVersion, "]"));
        }
    }
};
var printMarkdownTable = function (packageChanges) {
    var packageArray = Object.entries(packageChanges);
    if (packageArray.length < 1) {
        return;
    }
    var table = [
        [
            'Package',
            'Operation',
            'Base',
            'Target',
        ],
    ];
    console.log('| Package | Operation | Base | Target |');
    console.log('| - | - | - | - |');
    for (var _i = 0, packageArray_2 = packageArray; _i < packageArray_2.length; _i++) {
        var _a = packageArray_2[_i], packageName = _a[0], data = _a[1];
        var prevVersion = data.prevVersion, newVersion = data.newVersion, operation = data.operation;
        table.push([
            capitaliseWord(packageName),
            operation,
            prevVersion !== null && prevVersion !== void 0 ? prevVersion : '-',
            newVersion !== null && newVersion !== void 0 ? newVersion : '-',
        ]);
    }
    console.log((0, markdown_table_1.markdownTable)(table));
};
var run = function () {
    var _a, _b;
    var args = parseArgs({
        options: {
            base: {
                type: "string",
                short: "b",
            },
            format: {
                type: "string",
                short: "f",
            },
        },
    });
    var base = (_a = args.values.base) !== null && _a !== void 0 ? _a : 'HEAD';
    var format = (_b = args.values.format) !== null && _b !== void 0 ? _b : 'mdtable';
    var baselineLockfile = getBaselineLockfile(base);
    var currentLockfile = getCurrentLockfile();
    var packageChanges = diffPackages(baselineLockfile, currentLockfile);
    if (format === 'json') {
        console.log(JSON.stringify(packageChanges));
        return;
    }
    if (format === 'mdlist') {
        printMarkdownList(packageChanges);
        return;
    }
    printMarkdownTable(packageChanges);
};
run();
