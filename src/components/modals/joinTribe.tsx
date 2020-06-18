import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, Image} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'

export default function JoinTribe({visible}) {
  const { ui, chats } = useStores()
  const [loading,setLoading] = useState(false)

  function close(){
    ui.setJoinTribeParams(null)
  }
  const params = ui.joinTribeParams

  async function joinTribe(){
    setLoading(true)
    await chats.joinTribe({
      name: params.name,
      group_key: params.group_key,
      owner_alias: params.owner_alias,
      owner_pubkey: params.owner_pubkey,
      host: params.host || 'tribes.sphinx.chat',
      uuid: params.uuid,
      img: params.img,
      amount:params.price_to_join||0
    })
    setLoading(false)
    close()
  }

  let prices = []
  if(params){
    prices = [
      {label:'Price to Join', value:params.price_to_join},
      {label:'Price per Message', value:params.price_per_message},
      {label:'Amount to Stake', value:params.escrow_amount}
    ]
  }

  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Join Group" onClose={()=>close()} />

      {params && <View style={styles.content}>
        <Image source={{uri:params.img}} 
          style={{width:150,height:150,borderRadius:75,marginTop:15}} resizeMode={'cover'}
        />

        <Text style={{marginTop:15,fontWeight:'bold',fontSize:22}}>
          {params.name}
        </Text>

        <Text style={{marginTop:10,marginBottom:10}}>
          {params.description}
        </Text>

        <View style={styles.table}>
          {prices && prices.map((p,i)=>{
            return <View key={i} style={{...styles.tableRow,borderBottomWidth:i===prices.length-1?0:1}}>
              <Text style={styles.tableRowLabel}>{`${p.label}:`}</Text>
              <Text style={styles.tableRowValue}>{p.value||0}</Text>
            </View>
          })}
        </View>

        <Button onPress={joinTribe} mode="contained"
          dark={true} style={styles.button} loading={loading}>
          Join Group
        </Button>
      </View>}
    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
  },
  content:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    width:'100%',
    paddingBottom:20
  },
  button:{
    borderRadius:30,
    width:'80%',
    height:60,
    display:'flex',
    justifyContent:'center',
    position:'absolute',
    bottom:35,
  },
  table:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:5,
    marginTop:15,
  },
  tableRow:{
    borderBottomWidth:1,
    borderBottomColor:'#ccc',
    paddingLeft:10,
    paddingRight:10,
    paddingTop:5,
    paddingBottom:5,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  tableRowLabel:{
    minWidth:150,
  },
  tableRowValue:{
    fontWeight:'bold',
    display:'flex',
    alignItems:'center',
    minWidth:42,
    textAlign:'center'
  }
})