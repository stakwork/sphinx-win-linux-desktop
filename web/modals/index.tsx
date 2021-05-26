import React, {useEffect} from 'react'
import styled from 'styled-components'
import ViewImg from './viewImg'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import ConfirmInvoice from './confirmInvoice'
import SendRequest from './sendRequest'
import StartJitsi from './startJitsi'
import ViewContact from './viewContact'
import Profile from './profile'
import NewContact from './newContact'
import ShareInvite from './shareInvite'
import ViewTribe from './viewTribe'
import TribeInfo from './tribeInfo'
import Onchain from './onchain'
import {uiStore} from '../../src/store/ui'
import VersionModal from './versionModal'
import TribesAuthModal from './tribesAuthModal'
import PersonModal from './person'

const electron = window.require ? window.require("electron") : {}
if(electron.ipcRenderer) {
  electron.ipcRenderer.on('profile', (event, message) => {
    // open modal
    uiStore.setShowProfile(true)
  })
}

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
      {ui.showProfile && <Profile/>}
      {ui.newContact && <NewContact />}
      {ui.shareInviteModal && <ShareInvite />}
      {ui.viewTribe && <ViewTribe />}
      {ui.onchain && <Onchain />}
      {ui.showVersionDialog && <VersionModal />}
      {ui.tribeInfo && <TribeInfo />}
      {ui.tribesAuthParams && <TribesAuthModal params={ui.tribesAuthParams} />}
      {ui.personParams && <PersonModal params={ui.personParams} />}
    </Wrap>
  })
}

const Wrap = styled.div`
  position:fixed;
  top:0;left:0;bottom:0;right:0;
`

