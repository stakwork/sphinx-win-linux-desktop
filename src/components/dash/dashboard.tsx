import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores,useTheme} from '../../store'
import { View, StyleSheet } from 'react-native'
import { Searchbar } from 'react-native-paper'
import Header from './header'
import ChatList from '../chat/chatList'
import BottomBar from './bottomBar'

export default function Dashboard() {
  const {ui} = useStores()
  const theme = useTheme()
  return useObserver(()=>
    <View style={{...styles.main,backgroundColor:theme.bg}} accessibilityLabel="dashboard">
      <Header />
      <View style={{
        ...styles.searchWrap,
        backgroundColor:theme.main,
        borderBottomColor:theme.dark?'#141d26':'#e5e5e5'
      }}>
        <Searchbar
          placeholder="Search"
          onChangeText={txt=>{
            ui.setSearchTerm(txt)
          }}
          value={ui.searchTerm}
          style={{
            elevation:0,
            height:38,
            backgroundColor:theme.bg,
            borderRadius:5,
          }}
          inputStyle={{
            color:'#666',
            fontSize:13,
          }}
          iconColor={theme.title}
          placeholderTextColor={theme.title}
        />
      </View>
      <ChatList />
      <BottomBar />
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
    padding:5,
    width:'100%',
    borderBottomWidth:1,
  },
})
