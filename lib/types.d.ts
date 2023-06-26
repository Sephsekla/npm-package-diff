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

interface Lockfile {
	name: string,
	version: string,
	lockfileVersion?: number,
	requires?: boolean,
	packages: Packages,
}
 

interface Packages {
	[key: string]: {
		version: string,
	},
}

export type {
	Arguments,
	Diff,
	Lockfile,
	Packages,
}
