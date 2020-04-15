import React, {useState} from 'react'
import {View, StyleSheet, Dimensions, Text} from 'react-native'
import Scanner from '../../utils/scanner'
import {TextInput,Button} from 'react-native-paper'

export default function Scan({pay,loading}){
  const [addy, setAddy] = useState('')
  const [focused, setFocused] = useState(false)
  function scanned({ type, data }){
    if(data.length===66) setAddy(data)
  }
  const w = Dimensions.get('screen').width
  const h = Dimensions.get('screen').height

  const hasAddy=addy?true:false
  return <View style={{...styles.wrap,height:h-125}}>
    <View style={styles.top}>
      <View style={{...styles.scannerWrap,width:w,height:w,maxWidth:w,maxHeight:w}}>
        <Scanner height={w} scanned={hasAddy}
          handleBarCodeScanned={scanned}
        />
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          label="Scan or Enter Public Key"
          style={styles.input}
          onChangeText={e=> setAddy(e)}
          value={addy}
          onBlur={()=>setFocused(false)}
          onFocus={()=>setFocused(true)}
        />
      </View>
    </View>
    {!focused && hasAddy && <View style={styles.confirmWrap}>
      <Button style={styles.confirm}
        loading={loading}
        onPress={()=> pay(addy)}
        mode="contained" dark={true}>
        CONFIRM
      </Button>
    </View>}
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    width:'100%',
    position:'relative',
  },
  top:{
    flex:1,
    width:'100%',
    position:'relative',
  },
  scannerWrap:{
    flex:1,
    width:'100%',
    overflow:'hidden'
  },
  labelWrap:{
    width:'100%',
    height:50,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  inputWrap:{
    width:'100%',
    height:100,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  input:{
    height:58,
    maxHeight:58,
    flex:1,
    marginBottom:25,
    backgroundColor:'#fff',
    width:'80%'
  },
  confirmWrap:{
    width:'100%',
    position:'absolute',
    bottom:32,left:0,right:0,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  confirm:{
    backgroundColor:'#6289FD',
    height:35,
    width:150,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },
})