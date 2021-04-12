import React, {useState, useEffect} from 'react'
import {View, StyleSheet, Text} from 'react-native'
import NumKey from './numkey'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ActivityIndicator } from 'react-native-paper'
import SecureStorage from 'react-native-secure-storage'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'

const ssConfig = {service: 'sphinx_pin'}
// removeItem

const ns = [1,2,3,4,5,6]
export default function PIN(props) {
  const [pin, setPin] = useState('')
  const [chosenPin, setChosenPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [err, setErr] = useState(false)
  const [mode,setMode] = useState('choose')

  useEffect(()=>{
    (async () => {
      if(props.forceEnterMode) {
        setMode('enter')
        return
      }
      // await SecureStorage.removeItem('pin',ssConfig)
      const storedPin = await SecureStorage.getItem('pin', ssConfig)
      if(storedPin) setMode('enter')
    })()
  },[])

  async function check(thePin){
    if(props.forceEnterMode) {
      setChecking(true)
      return props.onFinish(thePin)
    }
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    })
    if(mode==='choose') {
      if(chosenPin){
        if(thePin===chosenPin){ // success!
          setChecking(true)
          await setPinCode(thePin)
          props.onFinish()
        } else {
          setErr(true)
          setPin('')
          setChosenPin('')
        }
      } else {
        setChosenPin(thePin)
        setPin('')
      }
    }
    if(mode==='enter') {
      setChecking(true)
      try {
        const storedPin = await SecureStorage.getItem('pin',ssConfig)
        if(storedPin===thePin){
          AsyncStorage.setItem('pin_entered', ts())
          props.onFinish()
        } else {
          setErr(true)
          setPin('')
          setChecking(false)
        }
      } catch(e){}
    }
  }
  function go(v){
    const newPin = pin+v
    if(err) setErr(false)
    setPin(newPin)
    if(newPin.length===6){
      check(newPin)
    }
  }
  function backspace(){
    const newPin = pin.substr(0, pin.length-1)
    setPin(newPin)
  }

  let txt = 'ENTER PIN'
  if(mode==='choose') {
    txt='CHOOSE PIN'
    if(chosenPin) txt='CONFIRM PIN'
  }
  if(err) txt='TRY AGAIN!'

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

export async function userPinCode(): Promise<string> {
  try{
    const pin = await SecureStorage.getItem('pin', ssConfig)
    if(pin) return pin
    else return ''
  } catch(e) {
    return ''
  }
}

export async function setPinCode(pin): Promise<any> {
  AsyncStorage.setItem('pin_entered', ts())
  return await SecureStorage.setItem('pin', pin, ssConfig)
}

export async function updatePinTimeout(v){
  await AsyncStorage.setItem('pin_timeout', v)
}

export async function getPinTimeout(){
  let hours = 12
  let hoursString = await AsyncStorage.getItem('pin_timeout')
  if(hoursString) {
    const hoursInt = parseInt(hoursString)
    if(hoursInt||hoursInt===0) hours = hoursInt
  }
  return hours
}

export async function wasEnteredRecently(): Promise<boolean> {
  const now = moment().unix()
  const hours = await getPinTimeout()
  const enteredAtStr = await AsyncStorage.getItem('pin_entered')
  const enteredAt = parseInt(enteredAtStr)
  if(!enteredAt){
    return false
  }
  if(now < enteredAt+(60*60*hours)) {
    return true
  }
  return false
}

export async function clearPin(): Promise<boolean> {
  await SecureStorage.removeItem('pin',ssConfig)
  await AsyncStorage.removeItem('pin_entered')
  return true
}

function ts(){
  return moment().unix()+''
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
