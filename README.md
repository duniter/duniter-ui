# Duniter-ui

Duniter graphical interface. This is a developement package which is embedded in [Duniter software](https://git.duniter.org/nodes/typescript/duniter) on build phase.

## Installation

> Requires [NVM](https://github.com/nvm-sh/nvm#installing-and-updating)
> Requires [Yarn](https://classic.yarnpkg.com/en/docs/install/)

```bash
npm i -g nvm yarn
nvm install 9
nvm use 9
yarn --pure-lockfile
```

## Run

```bash
node run.js direct_webstart
```
or
```bash
node_modules/brunch/bin/brunch watch --server
```
