import { AppRegistry, Platform } from 'react-native'
import App from './App'
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
    'Require cycle:',
]);

// fetch logger
global._fetch = fetch;
global.fetch = function (uri, options, ...args) {
  return global._fetch(uri, options, ...args).then((response) => {
    console.log('-> fetch:', { request: { uri, options, ...args }, response });
    return response;
  });
};

AppRegistry.registerComponent('Sphinx', () => App)

// if (Platform.OS === 'web') {
//   const rootTag = document.getElementById('root') || document.getElementById('main')
//   AppRegistry.runApplication('Sphinx', { rootTag })
// }
