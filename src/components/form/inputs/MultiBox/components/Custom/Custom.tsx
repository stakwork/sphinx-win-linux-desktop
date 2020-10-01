import React, { useState, useRef, useEffect } from 'react'
import { usePrevious } from '../../helpers'
import {Text,TextInput,TouchableOpacity} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'

const momentFormat='MMMM D, YYYY'

export default function Custom({type,onFocus,onChange,value,isFocused,styles}){
  const [showDate, setShowDate] = useState(false)
  const numberInputRef = useRef(null)
  const previousIsFocused = usePrevious(isFocused);
  useEffect(()=>{
    if(!previousIsFocused && isFocused) {
      if(type==='date') {
        setShowDate(true)
      }
      if(type==='number') {
        if(numberInputRef&&numberInputRef.current){
          numberInputRef.current.focus()
        }
      }
    }
  },[isFocused])

  if(type==='number') {
    return <TextInput
      ref={numberInputRef}
      keyboardType="numeric"
      style={styles.numberInput}
      onChangeText={e=> onChange(parseInt(e))}
      onFocus={onFocus}
      value={(value||value===0)?value+'':''}
    />
  }
  if(type==='date'){
    return showDate ? <DateTimePicker
      testID="dateTimePicker"
      value={value?moment(value,momentFormat).toDate():new Date()}
      mode={'date'}
      is24Hour={true}
      display="default"
      onChange={(e:any)=> {
        setShowDate(false)
        const dateString = moment(e.nativeEvent.timestamp).format(momentFormat)
        onChange(dateString)
      }}
    /> : (<TouchableOpacity style={styles.dateInput}
      onPress={()=> {
        setShowDate(true)
        onFocus(true)
      }}>
      <Icon name="calendar" color="grey" size={20} />
      {value && <Text style={styles.dateValue}>{value}</Text>}
    </TouchableOpacity>)
  }
}