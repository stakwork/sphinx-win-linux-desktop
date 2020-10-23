import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player';
import moment from 'moment'
import EE, { EXTRA_TEXT_CONTENT } from '../../utils/ee'
import { ProgressBar, IconButton } from 'react-native-paper';
import momentDurationFormatSetup from "moment-duration-format";
import { StreamPayment } from '../../../store/feed';
momentDurationFormatSetup(moment);

export default class Controls extends TrackPlayer.ProgressComponent {
  fastForward = () => {
    TrackPlayer.seekTo(this.state.position + 10);
  }
  rewind = () => {
    TrackPlayer.seekTo(this.state.position < 10 ? 0 : this.state.position - 10)
  }
  feedClip = () => {
    // @ts-ignore
    const ep = this.props.episode
    // @ts-ignore
    const pod = this.props.pod
    if(!ep || !pod) return
    const obj:StreamPayment = {
      ts: Math.round(this.state.position), 
      itemID: ep.id,
      feedID: pod.id,
      title: ep.title,
      url: ep.enclosureUrl,
      type: 'clip'
    }
    // @ts-ignore
    if(this.props.myPubkey) obj.pubkey = this.props.myPubkey
    EE.emit(EXTRA_TEXT_CONTENT,obj)
  }
  track = (e) => {
    // @ts-ignore
    const { duration } = this.props
    if (duration) {
      const x = e.nativeEvent.locationX
      // @ts-ignore
      this.bar.measure((fx, fy, width, height, px, py) => {
        const ratio = x / width
        const secs = duration * ratio
        TrackPlayer.seekTo(secs);
      })
    }
  }
  render() {
    // @ts-ignore
    const { theme, onToggle, playing, duration } = this.props
    // @ts-ignore
    let time = moment.duration(this.state.position, 'seconds').format('hh:mm:ss')
    if (duration) {
      // @ts-ignore
      time += ` / ${moment.duration(duration, 'seconds').format('hh:mm:ss')}`
    }
    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressWrapTop}>
          <View style={{ height: 50, width: 100, display:'flex', justifyContent:'center' }}>
            <IconButton icon="chat"
              color={theme.title} size={20}
              onPress={this.feedClip}
              style={{marginTop:12}}
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
