import React from 'react'
import {StyleSheet,View,TouchableOpacity,Text} from 'react-native'
import {useTheme} from '../../store'

export default function Toggler({items,onSelect,selectedItem,width,extraStyles}){
  const theme = useTheme()
  const WIDTH = width
  const w = WIDTH/items.length
  return <View style={styles.wrap}>
    <View style={{...styles.border, ...extraStyles,
      borderColor:theme.dark?'#555':'#ddd',
      minWidth:WIDTH, maxWidth:WIDTH
    }}>
      {items.map((item,i)=>{
        const selected = item===selectedItem
        const color = theme.dark?theme.title:(selected?'white':theme.title)
        return <TouchableOpacity onPress={()=>onSelect(item)} key={i}
          style={{
            ...styles.item,
            minWidth:w, width:w,
            backgroundColor:selected?theme.primary:'transparent',
            borderLeftWidth:i===0?0:1,
            borderColor:theme.dark?'#555':'#ddd',
          }}>
          <Text style={{color}}>{item}</Text>
        </TouchableOpacity>
      })}
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    height:50,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  border:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    height:32,
    borderRadius:16,
    borderWidth:1,
    overflow:'hidden',
    position:'relative'
  },
  item:{
    display:'flex',
    height:'100%',
    justifyContent:'center',
    alignItems:'center',
  }
})