import { Diff } from './types';
import { capitaliseWord } from './utils';

/**
 * Output a markdown-formatted list of package changes to the console.
 */
const printMarkdownList = ( packageChanges: Diff ) => {

	const packageArray = Object.entries( packageChanges );

	if ( packageArray.length < 1 ) {
		return;
	}

	for ( const [ packageName, data ] of packageArray ) {
		const { prevVersion, newVersion, operation } = data;
		switch ( operation ){
			case 'install':
				console.log( `- Install ${ packageName }[${ newVersion }]`);
				break;
			case 'uninstall':
				console.log( `- Uninstall ${ packageName } [${ prevVersion }]`);
				break;
			case 'update':
				console.log( `- Update ${ packageName } [${ prevVersion } => ${ newVersion }]`);
				break;
			case 'downgrade':
				console.log( `- Downgrade ${ packageName } [${ prevVersion } => ${ newVersion }]`);
				break;
			default:
				console.log( `- Change ${ packageName } [${ prevVersion } => ${ newVersion }]`);
		}

	}
};

/**
 * Output a markdown-formatted table of package changes to the console.
 */
async function printMarkdownTable( packageChanges: Diff ){

	const packageArray = Object.entries( packageChanges );

	if ( packageArray.length < 1 ) {
		return;
	}

	console.log( '| Package | Operation | Base | Target |' );
	console.log( '| - | - | - | - |' );

	for ( const [ packageName, data ] of packageArray ) {

		const { prevVersion, newVersion, operation } = data;
		console.log( ` | ${ capitaliseWord( packageName ) } | ${ operation } | ${ prevVersion ?? '-' } | ${ newVersion ?? '-' } |`);
	}
}

export {
	printMarkdownList,
	printMarkdownTable,
}
