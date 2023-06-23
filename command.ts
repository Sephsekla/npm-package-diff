#!/usr/bin/env node

const { readFileSync } = require('fs');
const parsedArgs = require( 'minimist' );
const { spawnSync } = require('node:child_process');
const { join } = require('node:path'); 

interface Arguments {
	_: string[],
	base?: string,
	b?: string,
};

const executeStep = ( cmd: string, args?: string[] ) => {
	
	const command =  spawnSync( cmd, args, { encoding: 'utf-8' } );
	
	if( command.status > 0 ) {
		console.error(command.stderr);
		process.exit(1);
	}

	return command.stdout;
}

const getBaselineLockfile = ( base: string ): string => {
	const file = executeStep('git', ['show', `${base}:package-lock.json`]);
	return JSON.parse( file );
}

const getCurrentLockfile = (): string => {

try {
	const file = readFileSync( join( process.cwd(), 'package-lock.json' ), 'utf8');
	return JSON.parse( file );
	} catch ( error ) {
		console.error( error );
		process.exit( 1 );
	}
}

const diffPackages = ( baselineLockfile, currentLockfile ) => {

	const baselinePackages = baselineLockfile?.packages ?? {};
	const currentPackages = currentLockfile?.packages ?? {};

	const allPackages = new Set( [
		...Object.keys( currentPackages ),
		...Object.keys( baselinePackages )
	] );

	allPackages.forEach( ( package: string ) => {

		if( ! package ) {
			return;
		}

		const prevVersion = baselinePackages[package]?.version;
		const newVersion = currentPackages[package]?.version;

		if( prevVersion === newVersion ) {
			return;
		}

		if( ! prevVersion ) {
			console.log( `Installed ${ package } version ${ newVersion }`);
			return;
		}

		if( ! newVersion ) {
			console.log( `Uninstalled ${ package } version ${ prevVersion }`);
			return;
		}


		if( prevVersion < newVersion ) {
			console.log( `Updated ${ package } from ${ prevVersion } to ${ newVersion }`);
			return;
		}

		if( prevVersion > newVersion ) {
			console.log( `Downgraded ${ package } from ${ prevVersion } to ${ newVersion }`);
			return;
		}

		console.log( `Changed ${ package } from ${ prevVersion } to ${ newVersion }`);
	} )

}

const run = () => {

	const args: Arguments = parsedArgs(process.argv.slice(2));
	const base: string = args.base ?? args.b ?? 'HEAD';

	const baselineLockfile: string = getBaselineLockfile( base );
	const currentLockfile: string = getCurrentLockfile();

	diffPackages( baselineLockfile, currentLockfile );

}

run();