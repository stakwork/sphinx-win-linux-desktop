import * as localForage from 'localforage'
import {botStore} from '../../src/store/bots'
import {chatStore} from '../../src/store/chats'
import {contactStore} from '../../src/store/contacts'
import {detailsStore} from '../../src/store/details'
import {memeStore} from '../../src/store/meme'
import {msgStore} from '../../src/store/msg'
import {subStore} from '../../src/store/subs'
import {userStore} from '../../src/store/user'

const electron = window.require ? window.require("electron") : {}

export default function onreset(callback){
  if(electron.ipcRenderer) {
    electron.ipcRenderer.on('reset', (event, message) => {
      localStorage.clear()
      localForage.clear()
      botStore.reset()
      chatStore.reset()
      contactStore.reset()
      detailsStore.reset()
      memeStore.reset()
      msgStore.reset()
      subStore.reset()
      userStore.reset()
      callback()
    })
  }
}
