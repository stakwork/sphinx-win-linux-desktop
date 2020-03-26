import React from 'react'
import AddFriend from './addFriend'
import Payment from './payment'
import ConfirmPayInvoice from './confirmPayInvoice'
import ShareInvite from './shareInvite'
import RawInvoiceModal from './rawInvoiceModal'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'

export default function Modals(){
  const {ui} = useStores()
  return useObserver(()=> {
    const showConfirmPayInvoice = ui.confirmInvoiceMsg&&ui.confirmInvoiceMsg.payment_request?true:false
    const showAddFriendModal = ui.addFriendModal?true:false
    const showRawInvoiceModal = ui.rawInvoiceModal
    return <>
      <AddFriend visible={showAddFriendModal} />
      <Payment visible={ui.showPayModal} />
      <ConfirmPayInvoice visible={showConfirmPayInvoice} />
      <ShareInvite visible={ui.shareInviteModal} />
      <RawInvoiceModal visible={showRawInvoiceModal} />
    </>
  })
}
