import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, Image} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'

export default function EditContact({visible}) {
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
      group_key: params.groupKey,
      host: params.host,
      uuid: params.uuid,
    })
    setLoading(false)
    close()
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

        <Text style={{marginBottom:10}}>Price to Join: {params.priceToJoin||0}</Text>

        <Text style={{marginBottom:10}}>Price per Message: {params.pricePerMessage||0}</Text>

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
  }
})