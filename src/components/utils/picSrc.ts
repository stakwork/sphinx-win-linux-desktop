import React, {useState, useEffect} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import {Chat} from '../../store/chats'
import { constants } from '../../constants'

const conversation = constants.chat_types.conversation

let dirs = RNFetchBlob.fs.dirs

export function usePicSrc(id){
  const [uri, setURI] = useState('')
  useEffect(()=>{
    (async () => {
      const src = await contactPicSrc(id)
      if(src&&src.uri) setURI(src.uri)
    })()
  },[])
  return uri
}

export function useChatPicSrc(chat: Chat){
  const [uri, setURI] = useState('')
  
  useEffect(()=>{
    (async () => {
      const isConversation = chat.type===conversation
      if(isConversation) {
        const cid = chat.contact_ids.find(id=>id!==1)
        const src = await contactPicSrc(cid)
        if(src&&src.uri) setURI(src.uri)
      } else {
        const src = await chatPicSrc(chat.id)
        if(src&&src.uri) setURI(src.uri)
      }
    })()
  },[])
  return uri
}

const inits = ['pics','attachments']
export async function initPicSrc(){
  inits.forEach(async i=>{
    const path = dirs.CacheDir + '/'+i
    try{
      const is = await RNFetchBlob.fs.isDir(path)
      if(!is) {
        await RNFetchBlob.fs.mkdir(path)
      }
    } catch(e){
      console.log(e)
    }
  })
}

export async function contactPicSrc(id): Promise<any> {
  const path = dirs.CacheDir + `/pics/contact_${id}`
  try {
    const exists = await RNFetchBlob.fs.exists(path)
    if(exists) return {uri:path}
  } catch(e) {
    console.log('error contactPicSrc',e)
  }
  return null
}

export async function chatPicSrc(id): Promise<any> {
  const path = dirs.CacheDir + `/pics/chat_${id}`
  try {
    const exists = await RNFetchBlob.fs.exists(path)
    if(exists) {
      return {uri:path}
    }
  } catch(e) {
    console.log('error chatPicSrc',e)
  }
  return null
}

export async function createContactPic(id, uri): Promise<any> {
  const path = dirs.CacheDir + `/pics/contact_${id}`
  try {
    const r = await RNFetchBlob.fs.cp(uri, path)
    return path
  } catch(e) {
    console.log('error createContactPic',e)
  }
}

export async function createChatPic(id, uri): Promise<any> {
  const path = dirs.CacheDir + `/pics/chat_${id}`
  try {
    const r = await RNFetchBlob.fs.cp(uri, path)
    return path
  } catch(e) {
    console.log('error createChatPic',e)
  }
}