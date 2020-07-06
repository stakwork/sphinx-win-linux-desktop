
import React, {useState,useEffect,useRef} from 'react';
import { Checkbox } from 'react-native-paper';
import {View,Text,StyleSheet,TextInput,TouchableOpacity} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function MultiBox({inverted,name,label,required,error,setValue,handleBlur,value,options}){
  return <View style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{label.en}</Text>
    </View>
    <View style={styles.body}>
      {options.map((o,i)=>{
        const isSelected = o.value===(value&&value.selected)
        return <View key={i} style={styles.optionWrap}>
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={()=> setValue({selected:o.value})}
            color="#6289FD"
          />
          <Text style={styles.optionLabel}>{o.label}</Text>
          {o.custom && <Custom type={o.custom} 
            value={(isSelected&&value&&value.custom)}
            isFocused={isSelected}
            onFocus={()=>setValue({
              selected:o.value,
              ...(value&&value.custom)&&{custom:value.custom}
            })}
            onChange={v=>setValue({
              selected:o.value,
              custom:v
            })}
          />}
          <Text style={styles.optionSuffix}>{o.suffix}</Text>
        </View>
      })}
    </View>
  </View>
}

const momentFormat='MMMM D, YYYY'

function Custom({type,onFocus,onChange,value,isFocused}){
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

const styles=StyleSheet.create({
  header:{
    width:'100%',
    backgroundColor:'#eee',
    borderTopColor:'#ddd',
    borderTopWidth:1,
    borderBottomColor:'#ddd',
    borderBottomWidth:1,
    paddingLeft:25,
    height:35,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  headerTitle:{
    fontSize:10,
    color:'grey',
    textTransform:'uppercase',
  },
  body:{
    width:'100%',
    paddingLeft:20,
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',
    paddingTop:15,
    paddingBottom:15,
  },
  optionWrap:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    height:50
  },
  optionLabel:{
    fontSize:15,
    marginRight:10,
    marginLeft:4,
    color:'#666'
  },
  optionSuffix:{
    fontSize:15,
    color:'#aaa',
    marginLeft:10,
  },
  numberInput:{
    borderWidth:1,
    borderColor:'#bbb',
    height:35,
    paddingLeft:6,
    paddingRight:6,
    borderRadius:5,
    width:75,
    textAlign:'center',
    fontSize:15,
    paddingBottom:7
  },
  dateInput:{
    borderWidth:1,
    borderColor:'#bbb',
    height:35,
    paddingLeft:6,
    paddingRight:6,
    borderRadius:5,
    width:150,
    fontSize:15,
    display:'flex',
    flexDirection:'row',
    alignItems:'center'
  },
  dateValue:{
    marginLeft:8
  }
})

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}