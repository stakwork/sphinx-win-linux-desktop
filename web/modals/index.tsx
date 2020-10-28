import React from 'react'
import styled from 'styled-components'
import ViewImg from './viewImg'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import ConfirmInvoice from './confirmInvoice'
import SendRequest from './sendRequest'
import StartJitsi from './startJitsi'
import ViewContact from './viewContact'

export default function Modals(){
  const {ui} = useStores()
  return useObserver(()=>{
    let display = 'none'
    if(ui.imgViewerParams || ui.confirmInvoiceMsg || ui.sendRequestModal) display='flex'
    return <Wrap style={{display}}>
      {ui.imgViewerParams && <ViewImg params={ui.imgViewerParams} />}
      {ui.confirmInvoiceMsg && <ConfirmInvoice params={ui.confirmInvoiceMsg} />}
      {ui.sendRequestModal && <SendRequest />}
      {ui.startJitsiParams && <StartJitsi />}
      {ui.viewContact && <ViewContact />}
    </Wrap>
  })
}

const Wrap = styled.div`
  position:fixed;
  top:0;left:0;bottom:0;right:0;
`