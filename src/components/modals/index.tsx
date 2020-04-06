import React from 'react'
import AddFriend from './addFriend'
import Payment from './payment'
import ConfirmPayInvoice from './confirmPayInvoice'
import ShareInvite from './shareInvite'
import RawInvoiceModal from './rawInvoiceModal'
import ImageViewer from './imgViewer'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import NewGroupModal from './newGroupModal'
import JitsiMeet from './jitsiMeet'
import EditContactModal from './editContact'
import GroupModal from './newGroupModal/groupInfo'

export default function Modals(){
  const {ui} = useStores()
  return useObserver(()=> {
    const showConfirmPayInvoice = ui.confirmInvoiceMsg&&ui.confirmInvoiceMsg.payment_request?true:false
    const showAddFriendModal = ui.addFriendModal?true:false
    const showNewGroupModal = ui.newGroupModal?true:false
    const showRawInvoiceModal = ui.rawInvoiceModal
    const showImageViewer = ui.imgViewerParams&&(ui.imgViewerParams.data||ui.imgViewerParams.uri)?true:false
    return <>
      <AddFriend visible={showAddFriendModal} />
      <Payment visible={ui.showPayModal} />
      <ConfirmPayInvoice visible={showConfirmPayInvoice} />
      <ShareInvite visible={ui.shareInviteModal} />
      <RawInvoiceModal visible={showRawInvoiceModal} />
      <NewGroupModal visible={showNewGroupModal} />
      {showImageViewer && <ImageViewer params={ui.imgViewerParams} />}
      {/* <JitsiMeet /> */}
      <EditContactModal visible={ui.editContactModal} />
      <GroupModal visible={ui.groupModal} />
    </>
  })
}
