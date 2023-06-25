#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { parseArgs } = require("node:util");
const markdown_1 = require("./lib/markdown");
const operations_1 = require("./lib/operations");
;
const run = () => {
    const args = parseArgs({
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
    const base = args.values.base ?? 'HEAD';
    const format = args.values.format ?? 'mdlist';
    const baselineLockfile = (0, operations_1.getBaselineLockfile)(base);
    const currentLockfile = (0, operations_1.getCurrentLockfile)();
    const packageChanges = (0, operations_1.diffPackages)(baselineLockfile, currentLockfile);
    if (format === 'json') {
        console.log(JSON.stringify(packageChanges, null, 4));
        return;
    }
    if (format === 'mdlist') {
        (0, markdown_1.printMarkdownList)(packageChanges);
        return;
    }
    (0, markdown_1.printMarkdownTable)(packageChanges);
};
run();
