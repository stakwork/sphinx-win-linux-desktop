import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import {View,StyleSheet} from 'react-native'

export default function BottomTabs() {
  const {ui} = useStores()

  return useObserver(()=>
    <View style={styles.bar}>



    </View>
  )
}

const styles=StyleSheet.create({
  bar:{
    flex:1,
    width:'100%',
    maxWidth:'100%',
    flexDirection:'row',
    alignItems:'center',
    height:60,
    maxHeight:60,
    minHeight:60,
    backgroundColor:'white',
    elevation:5,
    borderWidth: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
})
