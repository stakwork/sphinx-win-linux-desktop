import React, {useState} from 'react'
import {View, FlatList, Text, StyleSheet} from 'react-native'
import TrackPlayer from 'react-native-track-player';
import useInterval from '../../utils/useInterval'
import {useTheme} from '../../../store'
import Rocket from './rocket'

export default function Replay({msgs,playing}){
  const theme = useTheme()
  const [messages,setMessages] = useState([])
  async function getPosition(){
    const posf = await TrackPlayer.getPosition()
    const pos = Math.floor(posf)
    const newms = msgs ? msgs.filter(m=>m.ts<=pos && m.ts>pos-4) : []
    const msgsToShow = newms.map(m=>({...m, fading:m.ts===pos-3 }))
    setMessages(msgsToShow.slice(Math.max(0, msgsToShow.length-4)))
  }
  useInterval(()=>{
    if(playing) {
      getPosition()
    }
  }, 1000)
  console.log("MESSAGES",messages)
  const renderItem: any = ({ item, index }) => {
    const isBoost = item.type==='boost'
    const bg = isBoost?'#35806d':'white'
    let text = item.text
    return <View style={styles.row}>
      <View style={{...styles.bubble,backgroundColor:bg}}>
        {isBoost ? 
          <View style={styles.boostWrap}>
            <Rocket onPress={null} />
            <Text style={styles.boostText}>{item.amount||'100'}</Text> 
            <Text style={styles.boostSats}>sats</Text> 
          </View> :
          <Text style={styles.text}>{item.text}</Text>
        }
      </View>
    </View>
  }
  const showBackdrop = messages&&messages.length?true:false
  return <>
    <View style={{...styles.backdrop,backgroundColor:theme.main,opacity:showBackdrop?0.5:0}} />
    <FlatList 
      inverted
      style={{...styles.scroller}}
      nestedScrollEnabled
      data={messages}
      renderItem={renderItem}
      keyExtractor={(_,i)=>String(i)}
    />
  </>
}

const styles =StyleSheet.create({
  scroller:{
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
  },
  backdrop:{
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
  },
  row:{
    display:'flex',
    flexDirection:'row',
    padding:10,
  },
  bubble:{
    padding:15,
    backgroundColor:'white'
  },
  text:{
    fontSize:15,
    color:'black'
  },
  boostWrap:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center'
  },
  boostText:{
    fontWeight:'bold',
    color:'white'
  },
  boostSats:{
    marginLeft:8,
    color:'#ccc'
  }
})