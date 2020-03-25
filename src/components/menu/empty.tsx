import React from 'react'

import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {ScrollView, Text} from 'react-native'

export default function ChatList() {
  const { ui } = useStores()

  return useObserver(() =>
    <ScrollView>
      <Text>thing</Text>
    </ScrollView>
  )
}
