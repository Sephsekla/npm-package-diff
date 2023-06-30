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

### Example Usage

```sh
> npx package-diff

- Install @foo/bar [1.2.3]
- Uninstall lorem [2.0.0]
- Update ipsum [ 1.0.0 => 1.0.2 ]
```

```sh
> npx package-diff -f mdtable 

| Package | Operation | Base | Target |
| - | - | - | - |
| @foo/bar | install | - | 1.2.3 |
| lorem | uninstall | 2.0.0 | - |
| ipsum | update | 1.0.0 | 1.0.2 |
```

```sh
> npx package-diff -f json 

{
    "@foo/bar": {
        "operation": "install",
        "newVersion": "1.2.3"
    },
    "lorem": {
        "operation": "uninstall",
        "prevVersion": "2.0.0",
    },
    "ipsum": {
        "operation": "update",
        "prevVersion": "1.0.0",
        "newVersion": "1.0.2"
    }
}
```
