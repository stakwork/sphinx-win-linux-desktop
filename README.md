# sphinx-android

[![StakWork](https://img.shields.io/badge/-StakWork%20Bounty-informational?logo=bitcoin&link=https%3A%2F%2Fsphinx.chat)](https://sphinx.chat)

React-Native Android client for Sphinx network

### contributing

1. clone the repo
2. `npm install`
3. Rename `android/app/build.copy.gradle` to `android/app/build.gradle`
4. `react-native run-android`

- Each merge request should include documentation:
  - purpose of changes
  - any libraries added & if they need linking
  - any changes in Android manifest, etc

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

