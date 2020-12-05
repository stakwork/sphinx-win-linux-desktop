import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, useTheme } from '../../store'
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native'
import {Button, Portal, TextInput} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'

export default function JoinTribe({visible}) {
  const { ui, chats } = useStores()
  const theme = useTheme()
  const [loading,setLoading] = useState(false)
  const [alias,setAlias] = useState('')
  const [key,setKey] = useState(false)

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
      amount:params.price_to_join||0,
      is_private:params.private,
      ...alias && {my_alias:alias},
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

  const h = Dimensions.get('screen').height

  const hasImg = params&&params.img?true:false
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Join Group" onClose={()=>close()} />

      {params && <View style={styles.content}>
        <Image source={hasImg?{uri:params.img}:require('../../../android_assets/tent.png')} 
          style={{width:150,height:150,borderRadius:75,marginTop:15}} resizeMode={'cover'}
        />

        <Text style={{marginTop:15,fontWeight:'bold',fontSize:22,color:theme.title}}>
          {params.name}
        </Text>

        <Text style={{marginTop:10,marginBottom:10,paddingLeft:15,paddingRight:15,color:theme.title}}>
          {params.description}
        </Text>

        {!key && <View style={styles.table}>
          {prices && prices.map((p,i)=>{
            return <View key={i} style={{...styles.tableRow,borderBottomWidth:i===prices.length-1?0:1}}>
              <Text style={{...styles.tableRowLabel,color:theme.title}}>
                {`${p.label}:`}
              </Text>
              <Text style={{...styles.tableRowValue,color:theme.title}}>
                {p.value||0}
              </Text>
            </View>
          })}
        </View>}

        <TextInput mode="outlined"
          placeholder="Your Name in this Tribe"
          onChangeText={e=> setAlias(e)}
          value={alias}
          style={styles.input}
          onFocus={()=> setKey(true)}
          onBlur={()=> setKey(false)}
        />

        <Button onPress={joinTribe} mode="contained"
          dark={true} style={{...styles.button,top:h-250}} loading={loading}>
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
  },
  table:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:5,
    marginTop:15,
    width:240
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
    minWidth:62,
    textAlign:'right'
  },
  input:{
    maxHeight:65,
    marginTop:15,
    minWidth:240
  }
})