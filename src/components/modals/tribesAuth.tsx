import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, TextInput} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'

export default function TribesAuth({visible}) {
  const { ui, auth, user } = useStores()
  const [loading,setLoading] = useState(false)
  function close(){
    ui.setTribesAuthParams(null)
  }

  async function authorize(j){
    setLoading(true)
    try {
      const data = await auth.verifyExternal();
      if(data.info && data.token) {
        const body = data.info
        body.url = user.currentIP
        const protocol = j.host.includes("localhost") ? "http" : "https";
        await fetch(`${protocol}://${j.host}/verify/${j.challenge}?token=${data.token}`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch(e) {}
    setLoading(false)
    close()
  }

  const params = ui.tribesAuthParams
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Authorize" onClose={()=>close()} />

      {params && <View style={styles.modal}>
        <Text style={styles.authorize}>Authorize With</Text>
        <Text style={styles.host}>{params.host}</Text>
        <View style={styles.buttonWrap}>
          <Button mode="contained"
            onPress={()=> authorize(params)} 
            dark={true} style={styles.button} loading={loading}>
            Authorize
          </Button>
        </View>
      </View>}
    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
    paddingTop:20,
    display:'flex',
    flexDirection:'column',
    alignItems:'center'
  },
  authorize:{
    fontWeight:'bold',
    paddingTop:10,
    fontSize:18
  },
  host:{
    fontWeight:'bold',
    marginTop:20,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:4,
    padding:10,
    backgroundColor:'#eee'
  },
  buttonWrap:{
    width:'100%',
    maxHeight:60,
    flexDirection:'row-reverse',
    justifyContent:'center',
    marginTop:40
  },
  button:{
    borderRadius:30,
    width:'80%',
    height:60,
    display:'flex',
    justifyContent:'center',
    zIndex:999,
    position:'relative',
  }
})