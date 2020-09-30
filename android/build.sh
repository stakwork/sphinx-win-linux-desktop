#!/bin/bash

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output app/src/main/assets/index.android.bundle --assets-dest app/src/main/res/

rm -rf ./app/src/main/res/drawable-*
rm -rf ./app/src/main/res/raw

./gradlew clean

./gradlew app:assembleRelease