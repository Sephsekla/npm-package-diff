/**
 * Capitalise the first letter of a string and return the capitalised word.
 */
const capitaliseWord = ( word: string ) => (
	`${ word[0].toUpperCase() }${ word.slice(1) }`
);

export {
	capitaliseWord,
}
