#!/usr/bin/env node

const { readFileSync } = require( 'fs' );

const { spawnSync } = require( 'node:child_process' );
const { join } = require( 'node:path' );
const { parseArgs } = require( "node:util" );

interface Arguments {
	values: {
		base?: string,
		format?: string,
	},
	positionals: string[]
};

const capitaliseWord = ( word: string ) => (
	`${ word[0].toUpperCase() }${ word.slice(1) }`
)

const executeStep = ( cmd: string, args?: string[] ) => {
	
	const command = spawnSync( cmd, args, { encoding: 'utf-8' } );
	
	if( command.status && command.status > 0 ) {
		console.error( command.stderr );
		process.exit( 1 );
	}

	return command.stdout;
}

const getBaselineLockfile = ( base: string ): string => {
	const file = executeStep('git', ['show', `${base}:package-lock.json`]);

	if( typeof( file ) !== 'string' ) {
		console.error( 'Could not parse base package-lock.json' );
		process.exit( 1 );
	}

	return JSON.parse( file );
}

const getCurrentLockfile = (): string => {

try {
	const file = readFileSync( join( process.cwd(), 'package-lock.json' ), 'utf8');
	return JSON.parse( file );
	} catch ( e ) {
		console.error( e );
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

	allPackages.forEach( ( packageName: string ) => {

		if( ! packageName ) {
			return;
		}

		const prevVersion = baselinePackages[packageName]?.version;
		const newVersion = currentPackages[packageName]?.version;

		if( prevVersion === newVersion ) {
			return;
		}

		const packageNiceName = packageName.replace( 'node_modules/', '' )

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

const printMarkdownList = ( packageChanges: Object ) => {

	const packageArray = Object.entries( packageChanges );

	if( packageArray.length < 1 ) {
		return;
	}

	for( const [ packageName, data ] of packageArray ) {
		const { prevVersion, newVersion, operation } = data;
		switch( operation ){
			case 'install':
				console.log( `- Install ${ packageName }[${ newVersion }]`);
				break;
			case 'uninstall':
				console.log( `- Uninstall ${ packageName } [${ prevVersion }]`);
				break;
			case 'update':
				console.log( `- Updat ${ packageName } [${ prevVersion } => ${ newVersion }]`);
				break;
			case 'downgrade':
				console.log( `- Downgrade ${ packageName } [${ prevVersion } => ${ newVersion }]`);
				break;
			default:
				console.log( `- Change ${ packageName } [${ prevVersion } => ${ newVersion }]`);
		}

	}
}

async function printMarkdownTable ( packageChanges: Object ){

	const packageArray = Object.entries( packageChanges );

	if( packageArray.length < 1 ) {
		return;
	}


	console.log( '| Package | Operation | Base | Target |' );
	console.log( '| - | - | - | - |' );
	
	for( const [ packageName, data ] of packageArray ) {

		const { prevVersion, newVersion, operation } = data;
		console.log( ` | ${ capitaliseWord( packageName ) } | ${ operation } | ${ prevVersion ?? '-' } | ${ newVersion ?? '-' } |`);
	}
}


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

export {};