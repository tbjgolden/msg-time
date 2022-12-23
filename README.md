# msg-time

![banner](banner.svg)

![npm](https://img.shields.io/npm/v/msg-time)
![coverage](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftbjgolden%2Fmsg-time%2Fmain%2Fcoverage.json&label=coverage&query=$.total.lines.pct&color=brightgreen&suffix=%25)
![npm type definitions](https://img.shields.io/npm/types/msg-time)
![license](https://img.shields.io/npm/l/msg-time)
[![install size](https://packagephobia.com/badge?p=msg-time)](https://packagephobia.com/result?p=msg-time)

Conventional commit message enforcer 🧐

**`msg-time`** checks that your commit message is a Conventional Commit. If it doesn't match the
spec, it will block the commit and print out a helpful error message (like `commitlint`).

It performs the same Conventional Commit checking **_but with a far smaller footprint_**.

When used with [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks) or
[`husky`](https://github.com/typicode/husky), it will block non-compliant commit messages.

## Background

**Why not just use `commitlint` instead?**

|                                      `msg-time` |    `commitlint` |
| ----------------------------------------------: | --------------: |
|                                          0 deps | 200 nested deps |
| ![](https://packagephobia.com/badge?p=msg-time) |          26.5MB |

> `commitlint` = `@commitlint/cli` + `@commitlint/config-conventional`

## Install

This package is available from the `npm` registry.

```sh
npm install --save-dev msg-time
```

## Usage

### With `husky`:

```sh
npx husky add .husky/commit-msg 'npx msg-time'
```

### With `simple-git-hooks`:

```json
{
  "name": "your-package-json",
  // ...
  "simple-git-hooks": {
    "commit-msg": "npx msg-time"
  }
  // ...
}
```

## Contributing

GitHub issues / PRs welcome.

Dev environment requires:

- node >= 16.14.0
- npm >= 6.8.0
- git >= 2.11

## Licence

Apache-2.0
