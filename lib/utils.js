"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitaliseWord = void 0;
/**
 * Capitalise the first letter of a string and return the capitalised word.
 */
const capitaliseWord = (word) => (`${word[0].toUpperCase()}${word.slice(1)}`);
exports.capitaliseWord = capitaliseWord;
