#!/usr/bin/env node


import type { Arguments, Lockfile } from './lib/types';

const { parseArgs } = require( "node:util" );

import { printMarkdownList, printMarkdownTable } from './lib/markdown' ;
import { diffPackages, getBaselineLockfile, getCurrentLockfile } from './lib/operations';

/**
 * Run the command
 */
const run = () => {

	const args: Arguments = parseArgs({
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

	const base: string = args.values.base ?? 'HEAD';
	const format: string = args.values.format ?? 'mdlist';

	const baselineLockfile: Lockfile = getBaselineLockfile( base );
	const currentLockfile: Lockfile = getCurrentLockfile();

	const packageChanges = diffPackages( baselineLockfile, currentLockfile );

	if ( format === 'json') {
		console.log( JSON.stringify( packageChanges, null, 4 ) );
		return;
	}

	if ( format === 'mdlist' ) {
		printMarkdownList( packageChanges );
		return;
	}

	printMarkdownTable( packageChanges );

}

run();
