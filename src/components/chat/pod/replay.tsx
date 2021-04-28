import React, { useState } from 'react'
import { View, FlatList, Text, StyleSheet } from 'react-native'
import TrackPlayer from 'react-native-track-player';
import useInterval from '../../utils/useInterval'
import { useTheme } from '../../../store'
import Rocket from './rocket'
import Avatar from '../msg/avatar'
import moment from 'moment'

export default function Replay({ msgs, playing }) {
  const theme = useTheme()
  const [messages, setMessages] = useState([])
  async function getPosition() {
    const posf = await TrackPlayer.getPosition()
    const pos = Math.floor(posf)
    const newms = msgs ? msgs.filter(m => m.ts <= pos && m.ts > pos - 4) : []
    const msgsToShow = newms.map(m => ({ ...m, fading: m.ts === pos - 3 }))
    setMessages(
      msgsToShow.slice(Math.max(0, msgsToShow.length - 4))
        .reverse()
    )
  }
  useInterval(() => {
    if (playing) {
      getPosition()
    }
  }, 1000)
  // console.log("MESSAGES", messages)
  const renderItem: any = ({ item, index }) => {
    const isBoost = item.type === 'boost'
    const bg = isBoost ? '#35806d' : 'white'
    let text = item.text
    return <View style={styles.row}>
      <Avatar alias={item.alias} />
      <View style={styles.righty}>
        <View style={styles.infoBar}>
          <Text style={styles.infoName}>{item.alias}</Text>
          <Text style={styles.infoDate}>{moment(item.date).format('hh:mm A')}</Text>
        </View>
        <View style={{ ...styles.bubble, backgroundColor: bg }}>
          {isBoost ?
            <View style={styles.boostWrap}>
              <Rocket onPress={null} />
              <View style={styles.boostTextWrap}>
                <Text style={styles.boostText}>{item.amount || '100'}</Text>
                <Text style={styles.boostSats}>sats</Text>
              </View>
            </View> :
            <Text style={styles.text}>{item.text}</Text>
          }
        </View>
      </View>
    </View>
  }
  const showBackdrop = messages && messages.length ? true : false
  return <>
    <View style={{ ...styles.backdrop, backgroundColor: theme.main, opacity: showBackdrop ? 0.5 : 0 }} />
    <ItemList
      style={{ ...styles.scroller }}
      data={messages}
      renderItem={renderItem}
    />
  </>
}

function ItemList({ data, renderItem, style }) {
  return <View style={style}>
    {data && data.map((item, index) => {
      return renderItem({ item, index })
    })}
  </View>
}

const styles = StyleSheet.create({
  scroller: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 18,
    display: 'flex',
    flexDirection: 'column-reverse'
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 18,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
  },
  bubble: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    opacity: 0.9,
  },
  text: {
    fontSize: 15,
    color: 'black',
    paddingTop: 12, paddingBottom: 12,
    paddingLeft: 15, paddingRight: 15,
  },
  boostWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  boostText: {
    fontWeight: 'bold',
    color: 'white'
  },
  boostSats: {
    marginLeft: 8,
    color: '#ccc'
  },
  boostTextWrap: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 20,
  },
  righty: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 6,
  },
  infoBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoDate: {
    color: 'white',
    opacity: 0.85,
    fontSize: 10,
    marginLeft: 6
  },
  infoName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11
  }
})