#!/usr/bin/env node

const { readFileSync } = require('fs');
const parsedArgs = require( 'minimist' );
const { spawnSync } = require('node:child_process');
const { join } = require('node:path'); 

interface Arguments {
	_: string[],
	base?: string,
	b?: string,
	format?: string,
	f?: string,
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

	const packageChanges = {};

	allPackages.forEach( ( package: string ) => {

		if( ! package ) {
			return;
		}

		const prevVersion = baselinePackages[package]?.version;
		const newVersion = currentPackages[package]?.version;

		if( prevVersion === newVersion ) {
			return;
		}

		const packageNiceName = package.replace( 'node_modules/', '' )

		if( ! prevVersion ) {
			packageChanges[packageNiceName] = {
				'operation': 'install',
				'newVersion': newVersion,
			}
			return;
		}

		if( ! newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': 'uninstall',
				'prevVersion': prevVersion,
			}
			return;
		}


		if( prevVersion < newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': 'update',
				'prevVersion': prevVersion,
				'newVersion': newVersion,
			}
			return;
		}

		if( prevVersion > newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': 'downgrade',
				'prevVersion': prevVersion,
				'newVersion': newVersion,
			}
			return;
		}

		packageChanges[packageNiceName] = {
			'operation': 'change',
			'prevVersion': prevVersion,
			'newVersion': newVersion,
		}
	} )

	return packageChanges;

}

const printMarkdown = ( packageChanges: Object ) => {

	const packageArray = Object.entries( packageChanges );
	
	for( const [ package, data ] of packageArray ) {
		const { prevVersion, newVersion, operation } = data;
		switch( operation ){
			case 'install':
				console.log( `- Installed ${ package }[${ newVersion }]`);
				break;
			case 'uninstall':
				console.log( `- Uninstalled ${ package } [${ prevVersion }]`);
				break;
			case 'update':
				console.log( `- Updated ${ package } [${ prevVersion } => ${ newVersion }]`);
				break;
			case 'downgrade':
				console.log( `- Downgraded ${ package } [${ prevVersion } => ${ newVersion }]`);
				break;
			default:
				console.log( `- Changed ${ package } [${ prevVersion } => ${ newVersion }]`);
		}

	}
}

const run = () => {

	const args: Arguments = parsedArgs(process.argv.slice(2));
	const base: string = args.base ?? args.b ?? 'HEAD';
	const format: string = args.format ?? args.f ?? 'markdown';

	const baselineLockfile: string = getBaselineLockfile( base );
	const currentLockfile: string = getCurrentLockfile();

	const packageChanges = diffPackages( baselineLockfile, currentLockfile );

	if ( format === 'json') {
		console.log( JSON.stringify( packageChanges ) );
		return;
	}

	if ( format === 'markdown' || format === 'md' ) {
		printMarkdown( packageChanges );
		return;
	}

	console.log( packageChanges );

}

run();