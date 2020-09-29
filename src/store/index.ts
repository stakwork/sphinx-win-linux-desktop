import React from 'react'
import { detailsStore } from './details'
import { uiStore } from './ui'
import { msgStore } from './msg'
import { contactStore } from './contacts'
import { chatStore } from './chats'
import { subStore } from './subs'
import { userStore } from './user'
import { memeStore } from './meme'
import { authStore } from './auth'
import { botStore } from './bots'
import { create } from 'mobx-persist'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import * as hookz from './hooks'
import * as localForage from 'localforage'

const strg = {
  ios: AsyncStorage,
  android: AsyncStorage,
  web: localForage,
}

const hydrate = create({
  storage: strg[Platform.OS] || localStorage,
  debounce: 280,
})

function init(){
  console.log('=> initialize store')
  Promise.all([
    hydrate('user', userStore),
    hydrate('details', detailsStore),
    hydrate('contacts', contactStore),
    hydrate('chats', chatStore),
    hydrate('meme', memeStore),
  ]).then(()=> {
    console.log('=> store initialized')
    uiStore.setReady(true)
    hydrate('msg', msgStore)
  })
}
init()

const ctx = React.createContext({
  details: detailsStore,
  msg: msgStore,
  contacts: contactStore,
  chats: chatStore,
  subs: subStore,
  ui: uiStore,
  user: userStore,
  meme: memeStore,
  auth: authStore,
  bots: botStore,
})

export const useStores = () => React.useContext(ctx)

export const hooks = hookz