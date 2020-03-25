import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import DashNav from './dash/dashnav'
import ContactsNav from './contacts/contactsNav'
import Profile from './profile/profile'
import DrawerContent from './menu/drawer'
import Modals from './modals'

const Drawer = createDrawerNavigator()

export default function MainNav() {
  return (<>
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dashboard" 
        drawerContent={props => <DrawerContent {...props} />}>
        <Drawer.Screen name="Dashboard" component={DashNav} />
        <Drawer.Screen name="Contacts" component={ContactsNav} />
        <Drawer.Screen name="Profile" component={Profile} />
      </Drawer.Navigator>
    </NavigationContainer>

    <Modals />
  </>)
}
