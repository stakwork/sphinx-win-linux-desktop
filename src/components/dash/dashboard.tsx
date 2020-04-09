import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { View, StyleSheet } from 'react-native'
import { Searchbar } from 'react-native-paper'
import Header from './header'
import ChatList from '../chat/chatList'
import BottomBar from './bottomBar'

export default function Dashboard() {
  const {ui} = useStores()
  return useObserver(()=>
    <View style={styles.main}>
      <Header />
      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Search"
          onChangeText={txt=>{
            ui.setSearchTerm(txt)
          }}
          value={ui.searchTerm}
          style={{elevation:0,height:38}}
          inputStyle={{color:'#666',fontSize:13}}
        />
      </View>
      <ChatList />
      {/* <BottomBar /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  main:{
    width:'100%',
    flex:1,
    backgroundColor:'#f3f3f3',
  },
  searchWrap:{
    backgroundColor:'#f0f0f0',
    padding:5,
    width:'100%',
  },
})
