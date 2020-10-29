import React, { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Button } from 'react-native-paper'
import { Props } from './types/props.interface'

export default function BridgeModal(props: Props) {
  const { params, authorize, onClose, styles } = props
  const [amt, setAmt] = useState('1000')
  const [authorizing, setAuthorizing] = useState(false)
  const showBudget = params.noBudget?false:true

  async function onAuthorizingHandler() {
    if (authorizing) return
    setAuthorizing(true)
    await authorize(showBudget?amt:0, params.challenge)
    setAuthorizing(false)
  }

  return <View style={styles.bridgeModal}>
    <Icon name="shield-check" size={54} color="#6289FD"
      style={{ marginRight: 4, marginLeft: 4 }}
    />
    <Text style={styles.modalText}>Do you want to authorize</Text>
    <Text style={styles.modalURL}>{params.url}</Text>
    {showBudget && <>
      <Text style={styles.modalText}>To withdraw up to</Text>
      <View style={styles.inputWrap}>
        <View style={styles.inputInnerWrap}>
          <TextInput value={amt}
            onChangeText={t => setAmt(t)}
            placeholder="Application Budget"
          />
          <Text style={styles.modalSats}>sats</Text>
        </View>
      </View>
    </>}
    <View style={styles.modalButtonWrap}>
      <Button
        labelStyle={{ color: 'grey' }}
        mode="contained" dark={true}
        style={{ ...styles.button, backgroundColor: '#ccc' }}
        onPress={onClose}
      >
        No
      </Button>
      <Button
        mode="contained"
        dark={true}
        style={{ ...styles.button }}
        onPress={onAuthorizingHandler} loading={authorizing}
      >
        Yes
      </Button>
    </View>
  </View>
}