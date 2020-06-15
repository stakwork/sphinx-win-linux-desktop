import React from 'react'
import {View} from 'react-native'
import {TextInput} from 'react-native-paper'
import {inputStyles} from './shared'
import QDialog from './qDialog'

export default function NumberInput({name,label,required,error,handleBlur,setValue,value,displayOnly,description}) {
  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  if(displayOnly) lab = label.en
  return <View style={{position:'relative'}}>
    <TextInput
      keyboardType="numeric"
      error={error}
      label={lab}
      style={inputStyles}
      onChangeText={e=> setValue(parseInt(e))}
      onBlur={handleBlur(name)}
      value={(value||value===0)?value+'':''}
    />
    {description && <QDialog description={description} 
      label={label.en}
    />}
  </View>
}
