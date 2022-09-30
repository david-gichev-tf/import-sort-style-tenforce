# import-sort-style-tenforce

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/david-gichev-tf/import-sort-style-tenforce?filename=package.json)
![npm](https://img.shields.io/npm/v/import-sort-style-tenforce?color=#97CA00)
![NPM](https://img.shields.io/npm/l/import-sort-style-tenforce)

Tenforce's import style for [import-sort](https://github.com/renke/import-sort). Based on [import-sort-style-renke](https://github.com/renke/import-sort/tree/302fe2d494307f4fedff7ad2b8a4b67d4eaad142/packages/import-sort-style-renke).

This is intended to be used as a custom style in conjuction with the [import-sort](https://github.com/renke/import-sort/) library.

<br>

# Setup guide

Add "import-sort-style-tenforce" as a (dev)dependency to your project (by inserting it in package.json) or adding it directly with:

>`yarn add import-sort-style-tenforce --dev`

or

>`npm i import-sort-style-tenforce --save-dev`

<br>

# Using import-sort

## In Visual Studio Code (as a plugin)

1. Install the [import-sort](https://marketplace.visualstudio.com/items?itemName=amatiasq.sort-imports) plugin in VSC.

2. Configure the plugin by adding the following code snippet in your package.json

```json
    "importSort": {
        ".js, .jsx, .es6, .es, .mjs, .ts, .tsx": {
            "parser": "babylon",
            "style": "tenforce"
        }
    }
```
3. Done! The sorting gets triggered when hitting save or you can call it manually by selecting the "Sort imports" command (<kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>P</kbd>). To save a file without sorting the imports select the "Save file without sorting imports" command.

<br>

## Command Line

You can modify files and sort their imports automatically via the command line with the help of [import-sort-cli](https://github.com/renke/import-sort/tree/master/packages/import-sort-cli).


### Instructions (from the [creator](https://github.com/renke/import-sort#command-line-import-sort-cli))

---

Sort your imports from the command line. Useful to sort all your files in bulk
or from a script in your `package.json`.

Install it with `npm install --save-dev import-sort-cli` or use it directly with
`npx import-sort-cli`.

_ATTENTION_: Since version 4 `--write` modifies file in-place. The old
`--overwrite` flag was removed. The CLI now behaves closer to
[prettier's](https://github.com/prettier/prettier) CLI. Also, the exit code is
now 0 even when unsorted were sorted (unless `--list-different` is used.)

```
Usage: import-sort [OPTION]... [FILE/GLOB]...

Options:
  --list-different, -l  Print the names of files that are not sorted.  [boolean]
  --write               Edit files in-place.                           [boolean]
  --with-node-modules   Process files inside 'node_modules' directory..[boolean]
  --version, -v         Show version number                            [boolean]
  --help, -h            Show help                                      [boolean]
```

---


<b>Tip</b>: To sort the imports in all .ts/.tsx files in your project run:

> `(npx) import-sort-cli --write ./**/**/*.ts{,x}`

<br>

# How it works

The imports are grouped and later sorted within those groups. New lines are added between certain groups. 

> Note: Global imports are imports outside the current page, local imports are inside it

<br>

### The ordering and categorizing is as follows:

- Absolute modules that aren't from tenforce and have no member
   > `import "Something"`

<i>New line</i>

- Absolute modules (not from tenforce) that have a namespace or default member
   > `import React from "react"`

<i>New line</i>

- Tenforce modules
   > `import { Action, ActionType } from "@tenforce/toolbox-button-push-react"`

<i>New line</i>

- Relative global imports that are not .tsx files and have no member
   > `import "../../../Defaults.scss"`

- Relative global imports that are not .tsx files
   > `import GlobalState from "../../../redux/global"`

<i>New line</i>

- Relative (local) imports that are not .tsx files and have no member
   > `import "./Page.scss"`

- Relative (local) imports that are not .tsx files
   > `import actions from "../../actions"`

<i>New line</i>

- Relative global imports (.tsx)
   > `import GridItem from "../../../components/widgets/components/GridItem"`

- Relative local imports (.tsx)
   > `import List from "../List.tsx"`

<i>New line</i>
