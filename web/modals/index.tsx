import React from 'react'
import styled from 'styled-components'
import ViewImg from './viewImg'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'

export default function Modals(){
  const {ui} = useStores()
  return useObserver(()=>{
    let display = 'none'
    if(ui.imgViewerParams) display='flex'
    return <Wrap style={{display}}>
      {ui.imgViewerParams && <ViewImg params={ui.imgViewerParams} />}
    </Wrap>
  })
}

const Wrap = styled.div`
  position:fixed;
  top:0;left:0;bottom:0;right:0;
`