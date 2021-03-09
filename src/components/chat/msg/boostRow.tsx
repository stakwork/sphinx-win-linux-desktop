import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../../store'
import CustomIcon from '../../utils/customIcons'
import AvatarsRow from './avatarsRow'

export default function BoostRow(props) {
  const theme = useTheme()
  const isMe = props.sender===props.myid
  // console.log(props.boosts_total_sats)

  let backgroundColor = isMe ? 
    (theme.dark?'#3d6188':'whitesmoke') : 
    (theme.dark?'#202a36':'white')

  const theBoosts = []
  if(props.boosts) {
    props.boosts.forEach(b=>{
      if(!theBoosts.find(bb=>(bb.sender_alias||bb.sender)===(b.sender_alias||b.sender))){
        theBoosts.push(b)
      }
    })
  }

  const hasBoosts = theBoosts?true:false
  const padn = props.pad?15:0
  return <View style={{...styles.row, maxWidth:'100%', marginTop:props.marginTop||0}}>
    <View style={{...styles.left,marginRight:18,marginBottom:padn,marginLeft:padn}}>
      <View style={{...styles.rocketWrap, backgroundColor:theme.accent}}>
        <CustomIcon color="white" size={15} name="fireworks" /> 
      </View>
      <Text style={{...styles.amt,color:theme.title}}>{props.boosts_total_sats}</Text>
      <Text style={{...styles.sats,color:theme.subtitle}}>sats</Text>
    </View>
    <View style={{...styles.right,marginLeft:8,marginBottom:padn,marginRight:padn}}>
      {hasBoosts && <AvatarsRow aliases={theBoosts.map(b=>{
        if(b.sender===props.myid) return props.myAlias||'Me'
        return b.sender_alias
      })} borderColor={backgroundColor} />}
    </View>
  </View>
}

const styles = StyleSheet.create({
  row:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    height:22,
    marginTop:6,
    width:'100%',
  },
  left:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    maxWidth:99
  },
  right:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  rocketWrap:{
    height:17,width:17,
    backgroundColor:'white',
    borderRadius:3,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  amt:{
    marginLeft:6,
    fontSize:10,
  },
  sats:{
    marginLeft:4,
    fontSize:10,
  }
})