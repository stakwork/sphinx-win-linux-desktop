import React from 'react'
import {TextInput} from 'react-native-paper'
import {inputStyles} from './shared'
import { useTheme } from '../../../store'

export default function TheTextInput({name,label,required,error,handleChange,handleBlur,value,displayOnly,accessibilityLabel}) {
  const theme = useTheme()
  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  if(displayOnly) lab = label.en
  return <TextInput
    disabled={displayOnly}
    accessibilityLabel={accessibilityLabel}
    error={error}
    label={lab}
    style={{...inputStyles,backgroundColor:theme.bg}}
    onChangeText={handleChange(name)}
    onBlur={handleBlur(name)}
    value={value}
  />
}