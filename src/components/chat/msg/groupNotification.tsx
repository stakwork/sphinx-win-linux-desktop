import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { constants } from '../../../constants'
import {useStores} from '../../../store'

export default function InfoBar(props){
  const {contacts} = useStores()

  const isJoin = props.type===constants.message_types.group_join
  const sender = contacts.contacts.find(c=>c.id===props.sender)
  const hasSender = sender?true:false
  
  return <View style={styles.wrap}>
    <View style={styles.content}>
      {hasSender && <Text style={styles.text}>
        {`${sender.alias} has ${isJoin?'joined':'left'} the group`}
      </Text>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    height:25,
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    marginBottom:10,
  },
  content:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    borderWidth:1,
    paddingLeft:15,
    paddingRight:15,
    borderRadius:12,
    borderColor:'#DADFE2',
    backgroundColor:'#F9FAFC',
    marginTop:5,
  }, 
  text:{
    fontSize:12,
    color:'#777'
  }
})