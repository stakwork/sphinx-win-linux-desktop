import React, { useReducer } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TouchableOpacity, View, Text, Image } from 'react-native'
import { Dialog, Portal, Button, Snackbar } from 'react-native-paper'
import { constantCodes } from '../../../constants'
import { useStores } from '../../../store'
import moment from 'moment'
import styles from './styles'
import inviteMsg from './helpers/inviteMsg'
import inviteIcon from './components'
import { initialState, reducer } from './reducer'

export default function InviteRow(props) {
  const { contacts, ui, details } = useStores()
  const { name, invite } = props
  const [state, dispatch] = useReducer(reducer, initialState)

  const statusString = constantCodes['invite_statuses'][invite.status]

  const expiredStatus = props.invite.status === 5
  const yesterday = moment().utc().add(-24, 'hours')
  const isExpired = moment(invite.created_at || (new Date())).utc().isBefore(yesterday)
  if (isExpired || expiredStatus) return <></>

  const actions = {
    'payment_pending': () => dispatch({ type: 'setDialogOpen', payload: true }),
    'ready': () => ui.setShareInviteModal(invite.invite_string),
    'delivered': () => ui.setShareInviteModal(invite.invite_string)
  }
  function doAction() {
    if (actions[statusString]) actions[statusString]()
  }
  function setDialogOpenToFalseHandler() {
    dispatch({ type: 'setDialogOpen', payload: false })
  }
  async function onConfirmHandler() {
    const balance = details.balance
    if (balance < invite.price) {
      dispatch({ type: 'setNotEnuff', payload: true })
      dispatch({ type: 'setDialogOpen', payload: false })
    } else {
      dispatch({ type: 'setLoading', payload: true })
      await contacts.payInvite(invite.invite_string)
      dispatch({ type: 'setConfirmed', payload: true })
      dispatch({ type: 'setDialogOpen', payload: false })
      dispatch({ type: 'setLoading', payload: false })
    }
  }
  function setNotEnuffHandler() {
    dispatch({ type: 'setNotEnuff', payload: false })
  }
  return <TouchableOpacity style={styles.chatRow} activeOpacity={0.5}
    onPress={doAction}>
    <View style={styles.inviteQR}>
      <Image style={{ height: 40, width: 40 }} source={require('../../../../android_assets/invite_qr.png')} />
    </View>
    <View style={styles.chatContent}>
      <View style={styles.chatContentTop}>
        <Text style={styles.chatName}>{`Invite: ${name}`}</Text>
        {invite.price && <Text style={styles.invitePrice}>{invite.price}</Text>}
      </View>
      <View style={styles.chatMsgWrap}>
        {inviteIcon(statusString)}
        <Text style={styles.chatMsg}>{inviteMsg(statusString, name, state.confirmed)}</Text>
      </View>
    </View>
    <Portal>
      <Dialog visible={state.dialogOpen} style={{ bottom: 10 }}
        onDismiss={setDialogOpenToFalseHandler}>
        <Dialog.Title>{`Pay for invitation?`}</Dialog.Title>
        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <Button onPress={setDialogOpenToFalseHandler} labelStyle={{ color: 'grey' }}>
            <Icon name="cancel" size={14} color="grey" />
            <View style={{ width: 4, height: 6 }}></View>
            <Text>Cancel</Text>
          </Button>
          <Button icon="credit-card" loading={state.loading} onPress={onConfirmHandler}>
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar
        visible={state.notEnuff}
        duration={3000}
        onDismiss={setNotEnuffHandler}>
        Not enough balance
      </Snackbar>
    </Portal>
  </TouchableOpacity>
}