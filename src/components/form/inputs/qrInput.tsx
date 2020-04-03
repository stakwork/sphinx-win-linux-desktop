import React, {useState} from 'react'
import {IconButton, TextInput, Portal} from 'react-native-paper'
import {View} from 'react-native'
import {inputStyles} from './shared'
import QR from '../../utils/qr'
import PubKey from '../../modals/pubkey'

export default function QrInput({name,label,required,handleChange,handleBlur,setValue,value,displayOnly}) {
  const [scanning,setScanning] = useState(false)
  function scan(data){
    setValue(data)
    setScanning(false)
  }

  let lab = `${label.en}${required?' *':''}`
  if(displayOnly) lab = label.en
  return <View style={{...inputStyles, ...styles.wrap}}>
    <TextInput
      disabled={displayOnly}
      label={lab}
      onChangeText={handleChange(name)}
      onBlur={handleBlur(name)}
      value={value}
      style={{backgroundColor:'#fff',paddingRight:32}}
    />
    <IconButton
      icon="qrcode-scan"
      color="#888"
      size={25}
      style={{position:'absolute',right:0,top:10}}
      onPress={()=> setScanning(true)}
    />

    {scanning && !displayOnly && <Portal>
      <QR onCancel={()=>setScanning(false)}
        onScan={data=>scan(data)}
      />
    </Portal>}

    {scanning && displayOnly && <Portal>
      <PubKey pubkey={value} visible={true}
        onClose={()=> setScanning(false)}      
      />
    </Portal>}
  </View>
}

const styles={
  wrap:{
    flex:1,
  },
}