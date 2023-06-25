"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffPackages = exports.getCurrentLockfile = exports.getBaselineLockfile = exports.executeCommand = void 0;
const { readFileSync } = require('fs');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');
const executeCommand = (cmd, args) => {
    const command = spawnSync(cmd, args, { encoding: 'utf-8' });
    if (command.status && command.status > 0) {
        console.error(command.stderr);
        process.exit(1);
    }
    return command.stdout;
};
exports.executeCommand = executeCommand;
const getBaselineLockfile = (base) => {
    const file = executeCommand('git', ['show', `${base}:package-lock.json`]);
    if (typeof (file) !== 'string') {
        console.error('Could not parse base package-lock.json');
        process.exit(1);
    }
    return JSON.parse(file);
};
exports.getBaselineLockfile = getBaselineLockfile;
const getCurrentLockfile = () => {
    try {
        const file = readFileSync(join(process.cwd(), 'package-lock.json'), 'utf8');
        return JSON.parse(file);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
};
exports.getCurrentLockfile = getCurrentLockfile;
const diffPackages = (baselineLockfile, currentLockfile) => {
    const baselinePackages = baselineLockfile?.packages ?? {};
    const currentPackages = currentLockfile?.packages ?? {};
    const allPackages = new Set([
        ...Object.keys(currentPackages),
        ...Object.keys(baselinePackages)
    ]);
    const packageChanges = {};
    allPackages.forEach((packageName) => {
        if (!packageName) {
            return;
        }
        const prevVersion = baselinePackages[packageName]?.version;
        const newVersion = currentPackages[packageName]?.version;
        if (prevVersion === newVersion) {
            return;
        }
        const packageNiceName = packageName.replace('node_modules/', '');
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
exports.diffPackages = diffPackages;
