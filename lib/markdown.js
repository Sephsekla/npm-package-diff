"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printMarkdownTable = exports.printMarkdownList = void 0;
const utils_1 = require("./utils");
/**
 * Output a markdown-formatted list of package changes to the console.
 */
const printMarkdownList = (packageChanges) => {
    const packageArray = Object.entries(packageChanges);
    if (packageArray.length < 1) {
        return;
    }
    for (const [packageName, data] of packageArray) {
        const { prevVersion, newVersion, operation } = data;
        switch (operation) {
            case 'install':
                console.log(`- Install ${packageName}[${newVersion}]`);
                break;
            case 'uninstall':
                console.log(`- Uninstall ${packageName} [${prevVersion}]`);
                break;
            case 'update':
                console.log(`- Update ${packageName} [${prevVersion} => ${newVersion}]`);
                break;
            case 'downgrade':
                console.log(`- Downgrade ${packageName} [${prevVersion} => ${newVersion}]`);
                break;
            default:
                console.log(`- Change ${packageName} [${prevVersion} => ${newVersion}]`);
        }
    }
};
exports.printMarkdownList = printMarkdownList;
/**
 * Output a markdown-formatted table of package changes to the console.
 */
async function printMarkdownTable(packageChanges) {
    const packageArray = Object.entries(packageChanges);
    if (packageArray.length < 1) {
        return;
    }
    console.log('| Package | Operation | Base | Target |');
    console.log('| - | - | - | - |');
    for (const [packageName, data] of packageArray) {
        const { prevVersion, newVersion, operation } = data;
        console.log(` | ${(0, utils_1.capitaliseWord)(packageName)} | ${operation} | ${prevVersion ?? '-'} | ${newVersion ?? '-'} |`);
    }
}
exports.printMarkdownTable = printMarkdownTable;
