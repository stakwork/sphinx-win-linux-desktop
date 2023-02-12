# sphinx-android

[![StakWork](https://img.shields.io/badge/-StakWork%20Bounty-informational?logo=bitcoin&link=https%3A%2F%2Fsphinx.chat)](https://sphinx.chat)

React / Electron Desktop app for Sphinx

## Contributing

1. Clone the repo.
2. Install dependencies.

```sh
 `npm install`
```

3. `npm run web`
4. `npm run electron`

### Pull Requests

- Each pull request should include documentation:
  - purpose of changes
  - any libraries added & if they need linking

### Development

- Desktop dev:
  - `npm run install-app-deps`
  - `npm run web`
  - if you are developing on a windows machine, change the `electron` script in `package.json` to: `set ELECTRON_DEV_URL=http://localhost:3000 && electron .`
  - in another terminal `npm run electron`

If you hit an error saying `electron-deeplink: unable to lock instance`, you can comment out the deeplink stuff in `public/electronjs/main.js` lines 35-45

**Desktop build**

- Windows

  - must build on Windows machine
  - npm run build
  - package.json postinstall script: `electron-builder install-app-deps --platform=win32`
  - remove "realm" from package.json dependencies (only needed for RN)
  - yarn && yarn dist:win (or npm i && npm run dist:win)

- Linux:
  - install `libsecret-1-dev` using `apt` (`apt-get`) 
  - npm run build
  - on mac? use docker image from here https://www.electron.build/multi-platform-build `electronuserland/builder`
  - package.json postinstall script: `electron-builder install-app-deps --platform=linux`
  - remove "realm" from package.json dependencies (only needed for RN)
  - yarn && yarn dist:linux

**react:**

- 100% typescript
- 100% function components and hooks
- Layouts in flexbox
- Self-contained, minimal components (each <150 LOC)

**State management:**

- "useStores" to get state in each component (few props)
- App state managed by mobx observables (except state local to a single component)
- All calls to backend managed in mobx actions (_src/store_). Each action should catch errors, but not throw any error
- Persist state with mobx-persist (dont directly use AsyncStorage)
- Incoming websocket messages managed from one interface (_src/store/websocketHandlers.ts_)
