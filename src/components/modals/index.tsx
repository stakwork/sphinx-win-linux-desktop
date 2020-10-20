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
import EditContactModal from './editContact'
import GroupModal from './newGroupModal/groupInfo'
import PaymentHistory from './paymentHistory'
import JoinTribe from './joinTribe'
import Oauth from './oauth'
import Support from './support'
import Subscribe from './subscribe'
import ShareTribe from './shareTribe'
import Redeem from './redeem'
import VidViewer from './vidViewer'

export default function Modals(){
  const {ui} = useStores()
  return useObserver(()=> {
    const showConfirmPayInvoice = ui.confirmInvoiceMsg&&ui.confirmInvoiceMsg.payment_request?true:false
    const showAddFriendModal = ui.addFriendModal?true:false
    const showNewGroupModal = ui.newGroupModal||ui.editTribeParams?true:false
    const showRawInvoiceModal = ui.rawInvoiceModal
    const showImageViewer = ui.imgViewerParams&&(ui.imgViewerParams.data||ui.imgViewerParams.uri||ui.imgViewerParams.msg)?true:false
    const showJoinTribe = ui.joinTribeParams?true:false
    const showOauth = ui.oauthParams?true:false
    const showSubModal = ui.subModalParams?true:false
    const showShareTribeUUID = ui.shareTribeUUID?true:false
    const showRedeemModal = ui.redeemModalParams?true:false
    const showVid = ui.vidViewerParams?true:false
    return <>
      {showAddFriendModal && <AddFriend visible={true} />}
      {ui.showPayModal && <Payment visible={true} />}
      {showConfirmPayInvoice && <ConfirmPayInvoice visible={true} />}
      {ui.shareInviteModal && <ShareInvite visible={true} />}
      {showRawInvoiceModal && <RawInvoiceModal visible={true} />}
      {showNewGroupModal && <NewGroupModal visible={true} />}
      {showImageViewer && <ImageViewer params={ui.imgViewerParams} />}
      {ui.editContactModal && <EditContactModal visible={true} />}
      {ui.groupModal && <GroupModal visible={true} />}
      {ui.paymentHistory && <PaymentHistory visible={true} />}
      {showJoinTribe && <JoinTribe visible={true} />}
      {showOauth && <Oauth visible={true} />}
      {ui.supportModal && <Support visible={true} />}
      {showSubModal && <Subscribe visible={true} />}
      {showRedeemModal && <Redeem visible={true} />}
      {showShareTribeUUID && <ShareTribe visible={true} />}
      {showVid && <VidViewer params={ui.vidViewerParams} />}
    </>
  })
}
