import React from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {IconButton} from 'react-native-paper'
import {useTheme} from '../../store'

const keys = [
  [1,2,3],[4,5,6],[7,8,9],['_',0,'back']
]

export default function NumKey(props) {
  const theme = useTheme()
  const h = props.squish?240:260
  return <View style={{...styles.wrap, 
      height:h, maxHeight:h, minHeight:h,
      backgroundColor: (props.dark||theme.dark)?'#212932':'white'
    }}>
    {keys.map((row,i)=>{
      return <View key={i} style={styles.row}>
        {row.map(key=>{
          if(key==='_') return <View key={key} style={styles.empty}/>
          if(key==='back'){
            return <TouchableOpacity key={key} style={styles.backWrap}
              onPress={()=>{
                if(props.onBackspace) props.onBackspace()
              }}>
              <IconButton icon="backspace" color={(props.dark||theme.dark)?'white':'#AAA'} 
                accessibilityLabel={`pin-number-backspace`}
              />
            </TouchableOpacity>
          }
          return <TouchableOpacity accessibilityLabel={`pin-number-key-${key}`} 
            key={key} style={styles.key}
            onPress={()=>{
              if(props.onKeyPress) props.onKeyPress(key)
            }}>
            <Text style={{...styles.keyText,color:(props.dark||theme.dark)?'white':'#777'}}>
              {key}
            </Text>
          </TouchableOpacity>
        })}
      </View>
    })}
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    width:'100%',
    flexDirection:'column'
  },
  row:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    height:'25%'
  },
  key:{
    width:'33.33%',
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  keyText:{
    fontSize:24,
    fontWeight:'bold'
  },
  empty:{
    width:'33.33%',
  },
  backWrap:{
    width:'33.33%',
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
})