import React, { useState, useEffect } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import { View, FlatList } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import ModalWrap from '../modalWrap'
import Header from '../modalHeader'
import Payment from './components'
import styles from './styles'

export default function PaymentHistory({visible}) {
  const { details,ui } = useStores()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  function close(){
    ui.setPaymentHistory(false)
  }

  useEffect(()=>{
    (async () => {
      if(visible) {
        setLoading(true)
        const ps = await details.getPayments()
        setPayments(ps)
        setLoading(false)
        console.log(payments.length)
      }
    })()
  },[visible])

  /**
   * renderItem component
   * @param {object} item - item object getting from map payment array
   * @param {number} index - index of item in the array
   */
  const renderItem: any = ({ item, index }: any) => <Payment key={index} styles={styles} {...item} />

  return useObserver(() => <ModalWrap onClose={close} visible={visible} noSwipe>
    <View style={styles.wrap}>
      <Header title="Payment History" onClose={close} />
      {!loading && (
        <FlatList<any>
          style={styles.scroller}
          data={payments}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.payment_hash)}
        />
      )}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator animating color="grey" />
        </View>
      )}
    </View>
  </ModalWrap>)
}