import React from 'react'
import Chat from '../chat/chat'
import Dashboard from './dashboard'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import {DashStackParamList} from '../../../src/types'

const Stack = createStackNavigator<DashStackParamList>()

export default function DashNav() {
  const opts: StackNavigationOptions = {
    //animationEnabled:false,
  }
  return (
    <Stack.Navigator initialRouteName="Home" headerMode="none" screenOptions={opts}>
      <Stack.Screen name="Home" component={Dashboard} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  )
}
