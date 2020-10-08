import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {useStores} from '../../../src/store'

export default function Pod({top,url,host}){
  const [loading,setLoading] = useState(false)
  const [pod,setPod] = useState(null)
  const {chats} = useStores()

  async function loadPod(){
    console.log("LOAD POD",host,url)
    setLoading(true)
    const thepod = await chats.loadFeed(host, '', url)
    console.log("THE POD",thepod)
    if(thepod) setPod(thepod)
    setLoading(false)
  }

  useEffect(()=>{
    loadPod()
  },[])

  return <PodWrap top={top}>
    hello
  </PodWrap>
}

const PodWrap = styled.div`
  width:100%;
  height:300px;
  background:black;
  position:absolute;
  top:${p=>p.top}px;
`