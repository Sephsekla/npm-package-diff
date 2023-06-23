#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var spawnSync = require('node:child_process').spawnSync;
var join = require('node:path').join;
var parseArgs = require("node:util").parseArgs;
;
var capitaliseWord = function (word) { return ("".concat(word[0].toUpperCase()).concat(word.slice(1))); };
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
    catch (e) {
        console.error(e);
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
function printMarkdownTable(packageChanges) {
    return __awaiter(this, void 0, void 0, function () {
        var packageArray, _i, packageArray_2, _a, packageName, data, prevVersion, newVersion, operation;
        return __generator(this, function (_b) {
            packageArray = Object.entries(packageChanges);
            if (packageArray.length < 1) {
                return [2 /*return*/];
            }
            console.log('| Package | Operation | Base | Target |');
            console.log('| - | - | - | - |');
            for (_i = 0, packageArray_2 = packageArray; _i < packageArray_2.length; _i++) {
                _a = packageArray_2[_i], packageName = _a[0], data = _a[1];
                prevVersion = data.prevVersion, newVersion = data.newVersion, operation = data.operation;
                console.log(" | ".concat(capitaliseWord(packageName), " | ").concat(operation, " | ").concat(prevVersion !== null && prevVersion !== void 0 ? prevVersion : '-', " | ").concat(newVersion !== null && newVersion !== void 0 ? newVersion : '-', " |"));
            }
            return [2 /*return*/];
        });
    });
}
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
    var format = (_b = args.values.format) !== null && _b !== void 0 ? _b : 'mdlist';
    var baselineLockfile = getBaselineLockfile(base);
    var currentLockfile = getCurrentLockfile();
    var packageChanges = diffPackages(baselineLockfile, currentLockfile);
    if (format === 'json') {
        console.log(JSON.stringify(packageChanges, null, 4));
        return;
    }
    if (format === 'mdlist') {
        printMarkdownList(packageChanges);
        return;
    }
    printMarkdownTable(packageChanges);
};
run();
