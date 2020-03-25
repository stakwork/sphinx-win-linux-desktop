import React from 'react'
import Contacts from './contacts'
import Contact from './contact'
import { createStackNavigator } from '@react-navigation/stack'
import {ContactsStackParamList} from '../../../src/types'

const Stack = createStackNavigator<ContactsStackParamList>()

export default function DashNav() {
  return (
    <Stack.Navigator initialRouteName="Contacts" headerMode="none">
      <Stack.Screen name="Contacts" component={Contacts} />
      <Stack.Screen name="Contact" component={Contact} />
    </Stack.Navigator>
  )
}
