import React from 'react'
import { detailsStore } from './details'
import { uiStore } from './ui'
import { msgStore } from './msg'
import { contactStore } from './contacts'
import { chatStore } from './chats'
import { subStore } from './subs'
import { userStore } from './user'
import { memeStore } from './meme'
import { create } from 'mobx-persist'
import { AsyncStorage } from 'react-native'

const hydrate = create({storage: AsyncStorage})

Promise.all([
  hydrate('user', userStore),
  hydrate('details', detailsStore),
  hydrate('contacts', contactStore),
  hydrate('chats', chatStore),
  hydrate('meme', memeStore)
]).then(()=> {
  uiStore.setReady(true)
})

const ctx = React.createContext({
  details: detailsStore,
  msg: msgStore,
  contacts: contactStore,
  chats: chatStore,
  subs: subStore,
  ui: uiStore,
  user: userStore,
  meme: memeStore,
})

export const useStores = () => React.useContext(ctx)