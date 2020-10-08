
import * as React from 'react';
import { RadioButton } from 'react-native-paper';
import {View,Text} from 'react-native'
import { useTheme } from '../../../store'

export default function Radio({inverted,name,label,required,error,setValue,handleBlur,value}){
  const theme = useTheme()
  const val = inverted ? (value?false:true) : (value||false)
  return <View style={{display:'flex',flexDirection:'row',alignItems:'center',marginTop:5,paddingLeft:5,marginBottom:18}}>
    <RadioButton
      value={value}
      status={val ? 'checked' : 'unchecked'}
      onPress={()=> setValue(!value)}
    />
    <Text style={{fontSize:12,marginLeft:5,color:theme.title}}>{label.en}</Text>
  </View>
}