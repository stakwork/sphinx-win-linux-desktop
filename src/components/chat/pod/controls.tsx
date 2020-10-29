import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player';
import moment from 'moment'
import EE, { EXTRA_TEXT_CONTENT } from '../../utils/ee'
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);
import Slider from '@react-native-community/slider';
import TouchableIcon from '../../utils/touchableIcon'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {IconButton} from 'react-native-paper'
import Rocket from './rocket'

export default class Controls extends TrackPlayer.ProgressComponent {
  fastForward = () => {
    TrackPlayer.seekTo(this.state.position + 30);
  }
  rewind = () => {
    TrackPlayer.seekTo(this.state.position < 10 ? 0 : this.state.position - 10)
  }
  feedClip = () => {
    const ep = this.props.episode
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
  track = (ratio) => {
    // @ts-ignore
    const { duration } = this.props
    if (duration) {
      const secs = duration * (ratio/100)
      TrackPlayer.seekTo(secs);
    }
  }
  render() {
    const { theme, onToggle, playing, duration } = this.props
    // @ts-ignore
    const progressText = moment.duration(this.state.position, 'seconds').format('hh:mm:ss')
    // @ts-ignore
    const durationText = moment.duration(duration, 'seconds').format('hh:mm:ss')
    return (
      <View style={styles.progressWrap}>

        <View style={styles.barWrap}>
          <View style={styles.progressBarWrap}>
            {/* <ProgressBar color="#6289FD"
              progress={this.getProgress()}
            // buffered={this.getBufferedProgress()}
            /> */}
            <Slider minimumValue={0} maximumValue={100}
              value={this.getProgress()*100}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.primary}
              thumbTintColor={theme.primary}
              onSlidingComplete={this.track}
            />
          </View>
          <Text style={{ ...styles.progressText, color: theme.title }}>{progressText}</Text>
          <Text style={{ ...styles.durationText, color: theme.title }}>{durationText}</Text>
        </View>

        <View style={styles.progressWrapBottom}>
          
          <View style={{ height: 55, width: 50, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton icon="comment-quote"
              color={theme.title} size={27}
              onPress={this.feedClip}
            />
          </View>

          <View style={styles.controls}>
            <TouchableIcon
              rippleColor={theme.title} size={48}
              onPress={this.rewind}
            >
              <Icon name="replay-10" color={theme.title} size={38} />
            </TouchableIcon>
            <IconButton icon={playing ? 'pause-circle' : 'play-circle'}
              color={theme.primary} size={42}
              onPress={onToggle}
              style={{marginLeft:18,marginRight:18}}
            />
            <TouchableIcon
              rippleColor={theme.title} size={48}
              onPress={this.fastForward}
            >
              <Icon name="forward-30" color={theme.title} size={38} />
            </TouchableIcon>
          </View>
          
          <View style={{ height: 55, width: 50, display: 'flex', justifyContent: 'flex-end' }}>
            <Rocket onPress={this.props.boost} />
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
  barWrap: {
    width: '100%',
    position: 'relative'
  },
  progressBarWrap: {
    height: 32,
    marginTop: 10,
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
  progressText: {
    position: 'absolute',
    top: 36,
    left: 0,
    fontSize: 10
  },
  durationText: {
    position: 'absolute',
    top: 37,
    right: 0,
    fontSize: 10
  }
})
