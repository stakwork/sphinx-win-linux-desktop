import React from 'react'
import Chat from '../chat/chat'
import Dashboard from './dashboard'
import { createStackNavigator } from '@react-navigation/stack'
import {DashStackParamList} from '../../../src/types'
import StatusBar from '../utils/statusBar';

const Stack = createStackNavigator<DashStackParamList>()

export default function DashNav() {
  return (
    <Stack.Navigator initialRouteName="Home" headerMode="none">
      <Stack.Screen name="Home" component={Dashboard} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  )
}
