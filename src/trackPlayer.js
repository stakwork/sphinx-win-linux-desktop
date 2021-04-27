var TrackPlayer = require('react-native-track-player');
import * as interval from './components/interval'

module.exports = async function() {

    TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

    TrackPlayer.addEventListener('remote-pause', () => {
        TrackPlayer.pause()
        interval.pause()
    });

    TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());

}