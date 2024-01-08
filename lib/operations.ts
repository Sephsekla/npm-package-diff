import type { Diff, Lockfile, Packages } from "./types";
import { Operation } from "./enums";

const { readFileSync } = require( 'fs' );
const { spawnSync } = require( 'node:child_process' );
const { join } = require( 'node:path' );

/**
 * Safely execute a shell command.
 */
const executeCommand = ( cmd: string, args?: string[] ) => {

	const command = spawnSync( cmd, args, { encoding: 'utf-8' } );

	if ( command.status && command.status > 0 ) {
		console.error( command.stderr );
		process.exit( 1 );
	}

	return command.stdout;
};

/**
 * Get lockfile from the base reference.
 */
const getBaselineLockfile = ( base: string ): Lockfile => {
	const file = executeCommand('git', [ 'show', `${base}:package-lock.json` ]);

	if ( typeof( file ) !== 'string' ) {
		console.error( 'Could not parse base package-lock.json' );
		process.exit( 1 );
	}

	return JSON.parse( JSON.stringify( file ) );
};

/**
 * Get lockfile from the current working directory.
 */
const getCurrentLockfile = (): Lockfile => {

	try {
		const file = readFileSync( join( process.cwd(), 'package-lock.json' ), 'utf8');
		return JSON.parse( file );
	} catch ( e ) {
		console.error( e );
		process.exit( 1 );
	}
}



/**
 * Compare 2 lockfiles and return an object recording the difference between them.
 */
const diffPackages = ( baselineLockfile: Lockfile, currentLockfile: Lockfile ) : Diff => {

	const baselinePackages: Packages = baselineLockfile?.packages ?? {};
	const currentPackages: Packages = currentLockfile?.packages ?? {};

	const allPackages = new Set( [
		...Object.keys( currentPackages ),
		...Object.keys( baselinePackages ),
	] );

	const packageChanges: Diff = {};

	allPackages.forEach( ( packageName: string ) => {

		if( ! packageName ) {
			return;
		}

		const prevVersion = baselinePackages[packageName]?.version;
		const newVersion = currentPackages[packageName]?.version;

		if( prevVersion === newVersion ) {
			return;
		}

		const packageNiceName: string = packageName.replace( 'node_modules/', '' )

		if( ! prevVersion ) {
			packageChanges[packageNiceName] = {
				'operation': Operation.Install,
				'newVersion': newVersion,
			}
			return;
		}

		if( ! newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': Operation.Uninstall,
				'prevVersion': prevVersion,
			}
			return;
		}


		if( prevVersion < newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': Operation.Update,
				'prevVersion': prevVersion,
				'newVersion': newVersion,
			}
			return;
		}

		if( prevVersion > newVersion ) {
			packageChanges[packageNiceName] = {
				'operation': Operation.Downgrade,
				'prevVersion': prevVersion,
				'newVersion': newVersion,
			}
			return;
		}

		packageChanges[packageNiceName] = {
			'operation': Operation.Change,
			'prevVersion': prevVersion,
			'newVersion': newVersion,
		}
	} )

	return packageChanges;

}

export {
	executeCommand,
	getBaselineLockfile,
	getCurrentLockfile,
	diffPackages,
}
