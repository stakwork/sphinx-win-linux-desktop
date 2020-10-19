import React, {useState, useRef} from 'react'
import {View,StyleSheet,TextInput} from 'react-native'
import { useStores } from '../../store'
import {Button} from 'react-native-paper'
import Slider from '../utils/slider'
import * as rsa from '../../crypto/rsa'

export default function NameAndKey(props) {
  const {onDone,z,show} = props
  const {contacts, user} = useStores()
  const [updating, setUpdating] = useState(false)
  const [text, setText] = useState('')

  const inputRef = useRef(null)

  async function ok(){
    setUpdating(true)
    const keyPair = await rsa.generateKeyPair()
    await contacts.updateContact(1, {
      alias: text,
      contact_key: keyPair.public
    })
    user.setAlias(text)
    inputRef.current.blur()
    onDone()
    setTimeout(()=>{
      setUpdating(false)
    },500)
  }
  return <Slider z={z} show={show} style={{backgroundColor:'#F5F6F8'}} accessibilityLabel="onboard-name">
    <TextInput value={text}
      ref={inputRef}
      placeholder="Set Nickname"
      style={styles.input}
      onChangeText={text => setText(text)}
    />
    <View style={styles.buttonWrap} accessibilityLabel="onboard-name-button-wrap">
      <Button mode="contained" dark={true}
        loading={updating}
        onPress={ok}
        disabled={!text}
        style={{...styles.button,backgroundColor:text?'#6289FD':'#ccc'}}>
        Next
      </Button>
    </View>
  </Slider>
}

const styles=StyleSheet.create({
  buttonWrap:{
    position:'absolute',
    bottom:42,
    width:'100%',
    height:60,
    display:'flex',
    flexDirection:'row-reverse',
  },
  button:{
    borderRadius:30,
    height:60,
    display:'flex',
    justifyContent:'center',
    width:150,
    marginRight:'12.5%'
  },
  input:{
    width:'75%',
    borderColor:'white',
    backgroundColor:'white',
    height:70,
    borderRadius:35,
    marginTop:30,
    fontSize:21,
    paddingLeft:25,
    paddingRight:25,
    marginLeft:'12.5%',
    marginRight:'12.5%',
    marginBottom:100,
  }
})