import React from 'react'
import {TextInput} from 'react-native-paper'
import {inputStyles} from './shared'

export default function NumberInput({name,label,required,error,handleBlur,setValue,value,displayOnly}) {
  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  if(displayOnly) lab = label.en
  return <TextInput
    keyboardType="numeric"
    error={error}
    label={lab}
    style={inputStyles}
    onChangeText={e=> setValue(parseInt(e))}
    onBlur={handleBlur(name)}
    value={value?value+'':''}
  />
}
