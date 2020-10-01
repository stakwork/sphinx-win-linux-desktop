import React, { useState } from 'react'
import { View, Dimensions } from 'react-native'
import { Button } from 'react-native-paper'
import Modal from 'react-native-modal'
import { useStores } from '../../../store'
import Header from './components'
import styles from './styles'

export default function ConfirmPayInvoice({visible}) {
  const {ui,msg} = useStores()
  const [loading, setLoading] = useState(false)

  function close(){
    ui.setConfirmInvoiceMsg(null)
  }

  async function pay(){
    const req = ui.confirmInvoiceMsg && ui.confirmInvoiceMsg.payment_request
    if(!req) return
    setLoading(true)
    await msg.payInvoice(ui.confirmInvoiceMsg)
    setLoading(false)
    close()
  }

  const height = Math.round(Dimensions.get('window').height)
  const amt = ui.confirmInvoiceMsg && ui.confirmInvoiceMsg.amount
  return (
    <Modal isVisible={visible}
      onSwipeComplete={close}
      style={{...styles.modal,top:height-200}}
      swipeDirection="down" swipeThreshold={20}>
      <View style={styles.main}>
        <Header amt={amt} onClose={close} styles={styles} />
        <View style={styles.confirmWrap}>
          <Button style={styles.confirm}
            loading={loading}
            onPress={pay}
            mode="contained" dark={true}>
            CONFIRM
          </Button>
        </View>
      </View>
    </Modal>
  )
}