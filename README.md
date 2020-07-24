# sphinx-android

[![StakWork](https://img.shields.io/badge/-StakWork%20Bounty-informational?logo=bitcoin&link=https%3A%2F%2Fsphinx.chat)](https://sphinx.chat)

React-Native Android and Web client for Sphinx network

### contributing

1. clone the repo
2. `npm install`
3. Rename `android/app/build.copy.gradle` to `android/app/build.gradle`
4. `react-native run-android`

- Each merge request should include documentation:
  - purpose of changes
  - any libraries added & if they need linking
  - any changes in Android manifest, etc

**development**

- Android dev:
  - uncomment the `"include": ["src"]` line in `tsconfig.json`
  - `react-native run-android`
  - package.json script: `"postinstall":"jetify"`

- Web dev:
  - uncomment the `"include": ["src/index.web.tsx","web"]` line in `tsconfig.json`
  - `npm run web`
  - in another terminal `npm run electron`
  - if you are developing on windows, change the `electron` script in `package.json` to start with the word `set` (`set ELECTRON_DEV_URL=...`)

**Desktop build**

- use docker images from here https://www.electron.build/multi-platform-build
- Windows
  - package.json postinstall script: `electron-builder install-app-deps --platform=win32`
  - image: `electronuserland/builder:wine`
  - yarn && yarn dist:win
- Linux:
  - package.json postinstall script: `electron-builder install-app-deps --platform=linux`
  - image: `electronuserland/builder`
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