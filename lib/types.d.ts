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

interface Diff {
	[key: string]: {
		operation: Operation,
		newVersion?: string,
		prevVersion?: string,
	},
}
 

export type {
	Arguments,
	Diff,
}
