import React, {useState, useRef, useEffect} from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player';
import moment from 'moment'
import EE, { EXTRA_TEXT_CONTENT } from '../../utils/ee'
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);
import Slider from '@react-native-community/slider';
import TouchableIcon from '../../utils/touchableIcon'
import { IconButton } from 'react-native-paper'
import Rocket from './rocket'
import CustomIcon from '../../utils/customIcons'
import { getPosition, setPosition } from './position'
import useInterval from '../../utils/useInterval'
import {StreamPayment} from '../../../store/feed'

export default function Controls(props) {
  const [pos,setPos] = useState(0)

  useEffect(()=>{
    const p = getPosition()
    if(p!==pos) setPos(p)
  },[])

  useInterval(()=>{
    const p = getPosition()
    if(p!==pos) setPos(p)
  }, 1000)

  async function fastForward() {
    const n = pos+30
    await TrackPlayer.seekTo(n);
    setPosition()
    setPos(n)
  }
  async function rewind() {
    const n = pos < 15 ? 0 : pos - 15
    await TrackPlayer.seekTo(n)
    setPosition()
    setPos(n)
  }
  function feedClip() {
    const ep = props.episode
    const pod = props.pod
    if (!ep || !pod) return
    const obj: StreamPayment = {
      ts: pos,
      itemID: ep.id,
      feedID: pod.id,
      title: ep.title,
      url: ep.enclosureUrl,
      type: 'clip'
    }
    if (props.myPubkey) obj.pubkey = props.myPubkey
    EE.emit(EXTRA_TEXT_CONTENT, obj)
  }
  async function track(ratio) {
    const { duration } = props
    if (duration) {
      const secs = Math.round(duration * (ratio / 100))
      await TrackPlayer.seekTo(secs);
      setPosition()
      setPos(secs)
    }
  }
  function getProgress(){
    if(!props.duration || !pos) return 0;
    return pos / props.duration;
  }

  const { theme, onToggle, playing, duration } = props

  // @ts-ignore
  const progressText = moment.duration(pos, 'seconds').format('hh:mm:ss')
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
            value={getProgress() * 100}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.primary}
            thumbTintColor={theme.primary}
            onSlidingComplete={track}
          />
        </View>
        <Text style={{ ...styles.progressText, color: theme.title }}>{progressText}</Text>
        <Text style={{ ...styles.durationText, color: theme.title }}>{durationText}</Text>
      </View>

      <View style={styles.progressWrapBottom}>

        <View style={{ height: 48, width: 50 }}>
          <TouchableIcon
            rippleColor={theme.title} size={48}
            onPress={feedClip}>
            <CustomIcon name="chat-quote" color={theme.title} size={24} />
          </TouchableIcon>
        </View>

        <View style={styles.controls}>
          <TouchableIcon
            rippleColor={theme.title} size={48}
            onPress={rewind}>
            <CustomIcon name="back-15" color={theme.title} size={28} />
          </TouchableIcon>
          <IconButton icon={playing ? 'pause-circle' : 'play-circle'}
            color={theme.primary} size={52}
            onPress={onToggle}
            style={{ marginLeft: 18, marginRight: 18 }}
          />
          <TouchableIcon
            rippleColor={theme.title} size={48}
            onPress={fastForward}>
            <CustomIcon name="forward-30" color={theme.title} size={28} />
          </TouchableIcon>
        </View>

        <View style={{ height: 55, width: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <Rocket onPress={props.boost} />
        </View>

      </View>

    </View>
  );
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
