# Package Diff Command

Generates a report of changes to npm packages in different formats. Inspired by [IonBazan/composer-diff](https://github.com/IonBazan/composer-diff).

## Installation

To install globally, run

```sh
npm install -g @sephsekla/npm-package-diff
```

Alternatively, you can install on the first run by specifying the package:

```sh
npx package-diff -p @sephsekla/npm-package-diff
```

### Requirements and Compatibility

Tested on current, pending and LTS Node versions:

- Node 16
- Node 18
- Node 19
- Node 20

Currently `npm` only, however `pnpm` and `Yarn` support is planned.

## Usage

Compare installed npm packages to the latest git commit:

```sh
npx package-diff
```

### Options

#### Base

```sh
-b, --base 
```

The base to compare against (a git branch or commit). Default `HEAD`

#### Format

```sh
-f, --format
```

The format to output:

| Option | Description |
| - | - |
| `mdlist` | A markdown-formatted list of changes *(Default)*
| `mdtable` | A markdown-formatted table of changes
| `json` | A json object featuring packages, operations and versions. Recommended for CI and chain commands.
