import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player';
import moment from 'moment'
import EE from '../../utils/ee'
import { ProgressBar, IconButton } from 'react-native-paper';
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

export default class Controls extends TrackPlayer.ProgressComponent {
  fastForward = () => {
    TrackPlayer.seekTo(this.state.position + 10);
  }
  rewind = () => {
    TrackPlayer.seekTo(this.state.position < 10 ? 0 : this.state.position - 10)
  }
  feedClip = () => {
    const ep = this.props.episode
    EE.emit('feed-clip',{
      position: this.state.position, 
      id: ep.id,
      title: ep.title,
    })
  }
  track = (e) => {
    const { duration } = this.props
    if (duration) {
      const x = e.nativeEvent.locationX
      this.bar.measure((fx, fy, width, height, px, py) => {
        const ratio = x / width
        const secs = duration * ratio
        TrackPlayer.seekTo(secs);
      })
    }
  }
  render() {
    const { theme, onToggle, playing, duration } = this.props
    let time = moment.duration(this.state.position, 'seconds').format('hh:mm:ss')
    if (duration) {
      time += ` / ${moment.duration(duration, 'seconds').format('hh:mm:ss')}`
    }
    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressWrapTop}>
          <View style={{ height: 50, width: 100, display:'flex', justifyContent:'center' }}>
            <IconButton icon="chat"
              color={theme.title} size={20}
              onPress={this.feedClip}
            />
          </View>
          <View style={styles.controls}>
            <IconButton icon="rewind-10"
              color={theme.title} size={20}
              onPress={this.rewind}
            />
            <IconButton icon={playing ? 'pause' : 'play'}
              color={theme.title} size={26}
              onPress={() => onToggle(this.state.position)}
            />
            <IconButton icon="fast-forward-10"
              color={theme.title} size={20}
              onPress={this.fastForward}
            />
          </View>
          <Text style={{ color: theme.title, width: 110, textAlign: 'right', fontSize: 11 }}>
            {time}
          </Text>
        </View>
        <TouchableOpacity onPress={this.track} style={styles.progressTouch}
          ref={r => this.bar = r}>
          <ProgressBar color="#6289FD"
            progress={this.getProgress()}
          // buffered={this.getBufferedProgress()}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controls:{
    display:'flex',
    alignItems:'center',
    flexDirection:'row'
  },
  progressWrap:{
    marginTop:5,
    display:'flex',
    width:'100%',
  },
  progressTouch:{
    height:45,
    display:'flex',
    justifyContent:'center'
  },
  progressWrapTop:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%',
  },
})
