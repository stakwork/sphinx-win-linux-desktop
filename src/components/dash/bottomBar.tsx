import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { useNavigation } from '@react-navigation/native'
import { View} from 'react-native'

export default function BottomTabs() {
  const {ui} = useStores()

  return useObserver(()=>
    <View>



    </View>
  )
}
