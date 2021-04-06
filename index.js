import 'react-native-gesture-handler';
import { AppRegistry, Platform, LogBox } from 'react-native'
import App from './App'
import TrackPlayer from 'react-native-track-player';

LogBox.ignoreLogs(['Require cycle:'])

AppRegistry.registerComponent('Sphinx', () => App)
TrackPlayer.registerPlaybackService(() => require('./src/trackPlayer.js'));

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main')
  AppRegistry.runApplication('Sphinx', { rootTag })
}
