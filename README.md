# sphinx-android

[![StakWork](https://img.shields.io/badge/-StakWork%20Bounty-informational?logo=bitcoin&link=https%3A%2F%2Fsphinx.chat)](https://sphinx.chat)

React-Native Android and Web client for Sphinx network

## Verify APK signature

1. Download [sig file](https://sphinx-apk.s3.amazonaws.com/app-release.apk.sig)

2. `gpg --verify app-release.apk.sig app-release.apk`

## Contributing

1. Clone the repo.
2. Install dependencies.

```sh
 `npm install`
```

3. Make a copy of `android/app/build.copy.gradle` and rename it to `android/app/build.gradle`.

```sh
cp android/app/build.copy.gradle android/app/build.gradle
```

4. Start the app.

```sh
npm run android
```

### Pull Requests
- Each pull request should include documentation:
  - purpose of changes
  - any libraries added & if they need linking
  - any changes in Android manifest, etc


### Development

- Android dev:
  - Uncomment the `"include": ["src"]` line in `tsconfig.json`.
    - Comment out the other `"include"` line that's intended for Desktop development.
  - `react-native run-android`
  - package.json script: `"postinstall":"jetify"`
  - switching from desktop->android dev? run `npm rebuild` and also `npm i` so that "jetify" runs

- Desktop dev:
  - switching from android->desktop dev? run `npm run install-app-deps`
  - uncomment the `"include": ["src/index.web.tsx","web"]` line in `tsconfig.json`
      - Comment out the other `"include"` line that's intended for Android development.
  - `npm run web`
  - in another terminal `npm run electron`
  - if you are developing on a windows machine, change the `electron` script in `package.json` to start with the word `set` (`set ELECTRON_DEV_URL=...`)

**Desktop build**

- Windows
  - must build on Windows machine
  - npm run build
  - package.json postinstall script: `electron-builder install-app-deps --platform=win32`
  - remove "realm" from package.json dependencies (only needed for RN)
  - yarn && yarn dist:win (or npm i && npm run dist:win)

- Linux:
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
- All calls to backend managed in mobx actions (*src/store*). Each action should catch errors, but not throw any error
- Persist state with mobx-persist (dont directly use AsyncStorage)
- Incoming websocket messages managed from one interface (*src/store/websocketHandlers.ts*)


### note

`react-native-track-player` has a dependency conflict w react-native-video, so must be 1.1.4 https://github.com/react-native-kit/react-native-track-player/issues/698

### note
```ts
//add this @types/react-native/index.d.ts

export class VirtualizedList<ItemT> extends React.Component<
  VirtualizedListProps<ItemT>
> {
  scrollToEnd: (params?: { animated?: boolean }) => void;
  scrollToIndex: (
    params: {
      animated?: boolean;
      index: number;
      viewOffset?: number;
      viewPosition?: number;
    }
  ) => void;
  scrollToItem: (
    params: { animated?: boolean; item: ItemT; viewPosition?: number }
  ) => void;
  scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
  recordInteraction: () => void;
}
```
