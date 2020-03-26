import React from 'react'
import {useObserver} from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { useNavigation,useRoute } from '@react-navigation/native'
import {Chat} from '../../store/chats'

export default function Header({chat}:{chat: Chat}) {
  // const {uiStore} = useStores()
  const navigation = useNavigation()

  // function handleMore(){console.log("pressed")}

  const {name} = chat
  return useObserver(()=>
    <Appbar.Header style={{width:'100%',backgroundColor:'white',elevation:5}}>
      <Appbar.BackAction onPress={()=>navigation.goBack()} />
      <Appbar.Content title={name} />
      {/* <Appbar.Action icon="bell-outline" onPress={handleMore} /> */}
    </Appbar.Header>
  )
}
