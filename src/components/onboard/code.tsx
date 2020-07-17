import React, {useState, useEffect} from 'react'
import {View,StyleSheet,Text,Image,TextInput} from 'react-native'
import {Title,IconButton,ActivityIndicator} from 'react-native-paper'
import QR from '../utils/qr'
import { useStores } from '../../store'
import RadialGradient from 'react-native-radial-gradient'
import {decode as atob} from 'base-64'
import * as e2e from '../../crypto/e2e'
import * as rsa from '../../crypto/rsa'
import PINCode, {setPinCode} from '../utils/pin'

export default function Code(props) {
  const {onDone,z,onRestore} = props
  const {user,contacts} = useStores()
  
  const [scanning, setScanning] = useState(false)
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [showPin,setShowPin] = useState(false)

  async function scan(data){
    setCode(data)
    setScanning(false)
    setTimeout(()=>{
      checkInvite(data)
    }, 333)   
  }

  // from relay QR code
  async function signupWithIP(s){
    const a = s.split('::')
    if(a.length===1) return
    setChecking(true)
    const ip = a[1]
    const pwd = a.length>2?a[2]:''
    await user.signupWithIP(ip)
    await sleep(200)
    const token = await user.generateToken(pwd)
    if(token) onDone()
    setChecking(false)
  }
  
  // sign up from invitation code (or restore)
  async function checkInvite(theCode){
    if(!theCode || checking) return
    setChecking(true)
    // restore
    try {
      const codeString = atob(theCode)
      if(codeString.startsWith('keys::')) {
        setShowPin(true)
        return
      }
      if(codeString.startsWith('ip::')){
        signupWithIP(codeString)
        return
      }
    } catch(e) {}

    const {ip,password} = await user.signupWithCode(theCode)
    await sleep(200)
    if (ip) {
      const token = await user.generateToken(password||'')
      if(token) onDone()
    }
    setChecking(false)
  }

  async function pinEntered(pin){
    const restoreString = atob(code)
    if(restoreString.startsWith('keys::')) {
      const enc = restoreString.substr(6)
      const dec = await e2e.decrypt(enc,pin)
      if(dec) {
        await setPinCode(pin)
        const priv = await user.restore(dec)
        if(priv) {
          rsa.setPrivateKey(priv)
          return onRestore()
        }
      } else {
        // wrong PIN
        setShowPin(false)
        setChecking(false)
      }
    }
  }

  if(showPin) {
    return <PINCode 
      forceEnterMode
      onFinish={async(pin) => {
        await sleep(240)
        pinEntered(pin)
      }}
    />
  }
  return <View style={{...styles.wrap,zIndex:z}}>
    <RadialGradient style={styles.gradient}
      colors={['#A68CFF','#6A8FFF']}
      stops={[0.1,1]}
      center={[80,40]}
      radius={400}>
      <Image source={require('../../../assets/sphinx-white-logo.png')} 
        style={{width:120,height:120}} resizeMode={'cover'}
      />
      <Title style={styles.welcome}>Welcome</Title>
      <Text style={styles.msg}>
        Paste the invitation text or scan the QR code
      </Text>
      <View style={styles.inputWrap}>
        <TextInput value={code}
          placeholder="Enter Code ..."
          style={styles.input}
          onChangeText={text => setCode(text)}
          onBlur={()=> checkInvite(code)}
        />
        <IconButton
          icon="qrcode-scan"
          color="#888"
          size={28}
          style={{position:'absolute',right:12,top:38}}
          onPress={()=> setScanning(true)}
        />
      </View>
      <View style={styles.spinWrap}>
        {checking && <ActivityIndicator animating={true} color="white" />}
      </View>
    </RadialGradient>
    {scanning && <View style={styles.qrWrap}>
      <QR showPaster={false}
        onCancel={()=>setScanning(false)}
        onScan={data=>scan(data)}
      />
    </View>}

  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
  },
  qrWrap:{
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
    zIndex:99,
    width:360,
    backgroundColor:'black'
  },
  gradient:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  welcome:{
    color:'white',
    fontSize:48,
    fontWeight:'bold',
    marginTop:48,
    lineHeight:48
  },
  msg:{
    color:'white',
    fontSize:20,
    marginTop:15,
    maxWidth:220,
    lineHeight:29,
    textAlign:'center'
  },
  input:{
    width:'100%',
    borderColor:'white',
    backgroundColor:'white',
    height:70,
    borderRadius:35,
    marginTop:30,
    fontSize:21,
    paddingLeft:30,
    paddingRight:65,
    marginBottom:50
  },
  inputWrap:{
    width:320,
    maxWidth:'90%',
    position:'relative',
    flexDirection:'row',
    justifyContent:'center'
  },
  spinWrap:{
    height:20,
  },
})


async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}