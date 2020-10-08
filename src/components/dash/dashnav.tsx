import React from 'react'
import Chat from '../chat/chat'
import Dashboard from './dashboard'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import {DashStackParamList} from '../../../src/types'
import {setTint} from '../utils/statusBar'
import {useTheme} from '../../store'

const Stack = createStackNavigator<DashStackParamList>()

export default function DashNav() {
  const opts: StackNavigationOptions = {
    //animationEnabled:false,
  }
  const theme = useTheme()
  return (
    <Stack.Navigator initialRouteName="Home" headerMode="none" screenOptions={opts}>
      <Stack.Screen name="Home" component={Dashboard} 
        listeners={{focus:()=>setTint('dark')}} 
      />
      <Stack.Screen name="Chat" component={Chat} 
        listeners={{focus:()=>setTint(theme.dark?'black':'light')}} 
      />
    </Stack.Navigator>
  )
}
