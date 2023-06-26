#!/usr/bin/env node

const { parseArgs } = require( "node:util" );

import { printMarkdownList, printMarkdownTable } from './lib/markdown' ;
import { diffPackages, getBaselineLockfile, getCurrentLockfile } from './lib/operations';

/**
 * Arguments used by the node command.
 */
interface Arguments {
	values: {
		base?: string,
		format?: string,
	},
	positionals: string[]
}

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

	const baselineLockfile: string = getBaselineLockfile( base );
	const currentLockfile: string = getCurrentLockfile();

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
