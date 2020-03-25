import React from 'react'
import {TextInput} from 'react-native-paper'
import {inputStyles} from './shared'

export default function TheTextInput({name,label,required,error,handleChange,handleBlur,value,displayOnly}) {
  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  if(displayOnly) lab = label.en
  return <TextInput
    error={error}
    label={lab}
    style={inputStyles}
    onChangeText={handleChange(name)}
    onBlur={handleBlur(name)}
    value={value}
  />
}