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
    TrackPlayer.seekTo(this.state.position + 30);
  }
  rewind = () => {
    TrackPlayer.seekTo(this.state.position < 10 ? 0 : this.state.position - 10)
  }
  feedClip = () => {
    // @ts-ignore
    const ep = this.props.episode
    // @ts-ignore
    const pod = this.props.pod
    if (!ep || !pod) return
    const obj: StreamPayment = {
      ts: Math.round(this.state.position),
      itemID: ep.id,
      feedID: pod.id,
      title: ep.title,
      url: ep.enclosureUrl,
      type: 'clip'
    }
    // @ts-ignore
    if (this.props.myPubkey) obj.pubkey = this.props.myPubkey
    EE.emit(EXTRA_TEXT_CONTENT, obj)
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
    const progressText = moment.duration(this.state.position, 'seconds').format('hh:mm:ss')
    // @ts-ignore
    const durationText = moment.duration(duration, 'seconds').format('hh:mm:ss')
    return (
      <View style={styles.progressWrap}>

        <View style={styles.barWrap}>
          <TouchableOpacity onPress={this.track} style={styles.progressTouch}
            ref={r => this.bar = r}>
            <ProgressBar color="#6289FD"
              progress={this.getProgress()}
            // buffered={this.getBufferedProgress()}
            />
          </TouchableOpacity>
          <Text style={{...styles.progressText,color:theme.title}}>{progressText}</Text>
          <Text style={{...styles.durationText,color:theme.title}}>{durationText}</Text>
        </View>

        <View style={styles.progressWrapBottom}>
          
          <View style={{height:50,width:50}}></View>
          <View style={styles.controls}>
            <IconButton icon="rewind-10"
              color={theme.title} size={24}
              onPress={this.rewind}
            />
            <IconButton icon={playing ? 'pause-circle' : 'play-circle'}
              color={theme.primary} size={42}
              onPress={onToggle}
            />
            <IconButton icon="fast-forward-30"
              color={theme.title} size={24}
              onPress={this.fastForward}
            />
          </View>
          <View style={{ height: 60, width: 50, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton icon="comment-quote"
              color={theme.title} size={27}
              onPress={this.feedClip}
            />
          </View>
          
        </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controls: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  progressWrap: {
    marginTop: 5,
    display: 'flex',
    width: '100%',
  },
  barWrap:{
    width:'100%',
    position:'relative'
  },
  progressTouch: {
    height: 32,
    marginTop:10,
    display: 'flex',
    justifyContent: 'center'
  },
  progressWrapBottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
  },
  progressText:{
    position:'absolute',
    top:36,
    left:0,
    fontSize:10
  },
  durationText:{
    position:'absolute',
    top:37,
    right:0,
    fontSize:10
  }
})
