#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const parsedArgs = require( 'minimist' );

interface Arguments {
	_: string[],
	base?: string,
	b?: string,
};

const executeStep = ( cmd: string, args?: string[] ) => {
	
	const command =  spawnSync( cmd, args, { encoding: 'utf-8' } );
	return command.stdout;
}

const getBaseLineLockfile = () => {
	const command = executeStep('git', ['show', `${base}:package-lock.json`]);
	return JSON.parse( command );
}

const args: Arguments = parsedArgs(process.argv.slice(2));

const base: string = args.base ?? args.b ?? 'HEAD';

const baselineLockfile = getBaseLineLockfile();