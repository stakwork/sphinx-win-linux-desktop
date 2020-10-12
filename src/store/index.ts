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
import { themeStore } from './theme'
import { feedStore } from './feed'
import { create } from 'mobx-persist'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import * as hookz from './hooks'
import * as localForage from 'localforage'

export const DEBOUNCE_TIME = 280

const strg = {
  ios: AsyncStorage,
  android: AsyncStorage,
  web: localForage,
}

const hydrate = create({
  storage: strg[Platform.OS] || localStorage,
  debounce: DEBOUNCE_TIME,
})

function init(){
  console.log('=> initialize store')
  Promise.all([
    hydrate('user', userStore),
    hydrate('details', detailsStore),
    hydrate('contacts', contactStore),
    hydrate('chats', chatStore),
    hydrate('meme', memeStore),
    hydrate('msg', msgStore)
  ]).then(()=> {
    console.log('=> store initialized')
    uiStore.setReady(true)
  })

  hydrate('theme', themeStore)
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
  feed: feedStore,
})

export const useStores = () => React.useContext(ctx)

export const useTheme = () => React.useContext(React.createContext(themeStore))

export const hooks = hookz