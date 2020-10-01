
import React from 'react';
import { Checkbox } from 'react-native-paper';
import {View,Text} from 'react-native'
import {Custom} from './components'
import styles from './styles'

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
          {o.custom && (
            <Custom
              styles={styles}
              type={o.custom}
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
            />
          )}
          <Text style={styles.optionSuffix}>{o.suffix}</Text>
        </View>
      })}
    </View>
  </View>
}