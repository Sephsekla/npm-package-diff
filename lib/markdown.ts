import { capitaliseWord } from './utils';

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


export {
	printMarkdownList,
	printMarkdownTable
}