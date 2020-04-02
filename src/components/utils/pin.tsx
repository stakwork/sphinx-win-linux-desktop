import React, {useState} from 'react'
import {View, StyleSheet, Text} from 'react-native'
import NumKey from './numkey'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ActivityIndicator, Colors } from 'react-native-paper'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";

const ns = [1,2,3,4,5,6]
export default function PIN(props) {
  const [pin, setPin] = useState('')
  const [chosenPin, setChosenPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [err, setErr] = useState(false)

  async function check(){
    if(props.mode==='choose') {
      if(chosenPin){
        if(pin===chosenPin){ // success!
          setChecking(true)
          await RNSecureKeyStore.set('pin', pin, {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
          props.onFinish()
        } else {
          setErr(true)
          setPin('')
          setChosenPin('')
        }
      } else {
        setChosenPin(pin)
        setPin('')
      }
    }
    if(props.mode==='enter') {
      setChecking(true)
      try {
        const storedPin = await RNSecureKeyStore.get('pin')
        if(storedPin===pin){
          props.onFinish()
        }
      } catch(e){}
    } 
  }
  function go(v){
    const newPin = pin+v
    if(err) setErr(false)
    if(newPin.length===6){
      setPin(newPin)
      check()
    } else if(newPin.length<6) {
      setPin(newPin)
    } 
  }
  function backspace(){
    const newPin = pin.substr(0, pin.length-1)
    setPin(newPin)
  }

  let txt = 'ENTER PIN'
  if(props.mode==='choose') {
    txt='CHOOSE PIN'
    if(chosenPin) txt='CONFIRM PIN'
    if(err) txt='TRY AGAIN!'
  }

  return <View style={styles.wrap}>
    <View style={styles.top}>
      <View style={styles.lock}>
        <Icon name="lock-outline" color="white" size={20} />
        <Text style={styles.choose}>{txt}</Text>
      </View>
      <View style={styles.circles}>
        {ns.map(n=> <View key={n} style={{
          backgroundColor:pin.length>=n?'white':'transparent',
          height:25, width:25, borderRadius:13,
          marginLeft:10,marginRight:10,
          borderWidth:1, borderColor:'white'
        }}/> )}
      </View>
      <View style={styles.spinWrap}>
        {checking && <ActivityIndicator animating={true} color="white" />}
      </View>
    </View>
    <NumKey onKeyPress={v=> go(v)} dark={true} 
      onBackspace={()=> backspace()}
    />
  </View>
}

export async function hasUserSetPinCode(): Promise<boolean> {
  try{
    const pin = await RNSecureKeyStore.get('pin')
    if(pin) return true
    else return false
  } catch(e) {
    return false
  }
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    backgroundColor:'#6289FD',
    width:'100%',
  },
  top:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    marginBottom:60,
  },
  lock:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  choose:{
    color:'white',
    fontWeight:'bold',
    fontSize:20,
    marginTop:20,
  },
  spinWrap:{
    height:20,
  },
  circles:{
    width:'100%',
    display:'flex',
    marginBottom:60,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  }
})
