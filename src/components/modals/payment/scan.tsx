import React, {useState} from 'react'
import {View, StyleSheet, Dimensions, Text} from 'react-native'
import Scanner from '../../utils/scanner'
import {TextInput,Button} from 'react-native-paper'
import {useTheme} from '../../../store'

export default function Scan({pay,loading,isLoopout,error}){
  const theme = useTheme()
  const [addy, setAddy] = useState('')
  const [focused, setFocused] = useState(false)
  function scanned({ type, data }){
    if(isLoopout) {
      if(data.startsWith('bitcoin:')) {
        const arr = data.split(':')
        if(arr.length>1) setAddy(arr[1])
      } else {
        setAddy(data)
      }
    }
    if(data.length===66) setAddy(data)
  }
  const w = Dimensions.get('screen').width
  const h = Dimensions.get('screen').height

  const boxHeight = h
  const hasAddy=addy?true:false
  return <View style={{...styles.wrap,height:h-125}}>
    <View style={styles.top}>
      <View style={{...styles.scannerWrap,width:w,height:boxHeight,maxWidth:w,maxHeight:boxHeight}}>
        <Scanner height={w} scanned={hasAddy}
          handleBarCodeScanned={scanned}
        />
      </View>
      {(error?true:false)&&<View style={styles.errorWrap}>
        <Text style={{color:theme.error,...styles.error}}>
          {error}
        </Text>
      </View>}
      <View style={styles.inputWrap}>
        <TextInput
          label={isLoopout?"Scan or Enter Bitcoin Address":"Scan or Enter Public Key"}
          style={styles.input}
          onChangeText={e=> setAddy(e)}
          value={addy}
          mode="outlined"
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
    height:150,
    display:'flex',
    alignItems:'center',
  },
  input:{
    height:58,
    maxHeight:58,
    flex:1,
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
  errorWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    marginBottom:20
  },
  error:{

  }
})