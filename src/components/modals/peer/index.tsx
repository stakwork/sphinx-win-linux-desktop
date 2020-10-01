import React, { useEffect } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import { View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { usePeer } from './usePeer'
import { HangUpButton, SmallVid, BigVid } from './components'
import styles from './styles'

export default function PeerChat({params}) {
  const { ui } = useStores()

  const peer = usePeer()

  function leave(){
    peer.destroy()
    ui.setRtcParams(null)
  }

  useEffect(()=>{
    setTimeout(()=>peer.join(), 150)
  },[])

  const hasLocalStream = peer.localStreamID?true:false
  const hasRemoteStream = peer.remoteStreamID?true:false

  return useObserver(() =>
    <View style={styles.wrap}>
      {hasLocalStream && <SmallVid styles={styles} streamURL={peer.localStreamID} />}

      {hasRemoteStream && <BigVid styles={styles} streamURL={peer.remoteStreamID}/>}

      {peer.joined && !hasRemoteStream && <ActivityIndicator 
        color={peer.open?'white':'grey'} animating={true}
      />}

      <View style={styles.toolbar}>
        <HangUpButton onPress={leave} styles={styles} />
      </View>

      {/*!joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> join()}>
          Join
        </Button>
      </View>*/}

      {/*joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={{...styles.button,backgroundColor:'#55D1A9'}}
          onPress={()=> leave()}>
          Leave
        </Button>
      </View>*/}
    </View>
  )
}