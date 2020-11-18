import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Avatar from '../utils/avatar'
import theme from '../theme'
import { useStores, useTheme } from '../../src/store'
import { hooks } from '../../src/store'
import moment from 'moment'
import PaymentIcon from '@material-ui/icons/Payment';
import { constantCodes } from '../../src/constants'
import Modal from '@material-ui/core/Modal';
import Button from '../utils/button'
import CheckIcon from '@material-ui/icons/Check';
const { useChatRow } = hooks

export default function InviteRow(props) {

    const { name, invite } = props
    const { contacts, ui, details } = useStores()
    const statusString = constantCodes['invite_statuses'][invite.status]
    const [confirmed, setConfirmed] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const expiredStatus = props.invite.status === 5
    const isExpired = moment(invite.expires_on || (new Date())).utc().isBefore(moment())

    if (isExpired || expiredStatus) return <></>

    const actions = {
        'payment_pending': () => {
            if (!confirmed) setDialogOpen(true)
        },
        'ready': () => ui.setShareInviteModal(invite.invite_string),
        'delivered': () => ui.setShareInviteModal(invite.invite_string)
    }

    function doAction() {
        console.log(statusString, confirmed)
        if (actions[statusString]) actions[statusString]()
    }

    async function onConfirmHandler() {
        const balance = details.balance
        if (balance < invite.price) {
          setDialogOpen(false)
        } else {
          setLoading(true)
          await contacts.payInvite(invite.invite_string)
          setConfirmed(true)
          setDialogOpen(false)
          setLoading(false)
        }
      }

      


    return <Wrap 
        onClick={doAction}
        style={{
            borderColor: theme.deep,
            background: theme.bg,
    }}>
        <QrCode>
            <img style={{ height: 40, width: 40, backgroundColor: 'white', border: '1px solid white' }} src={require('../../android_assets/invite_qr.png')} />
        </QrCode>
        <InviteText>
            <Name>Invite: {name}</Name>
            {invite.price && <InvitePrice>{invite.price}</InvitePrice>}
            <PayMsg>
                {inviteIcon(statusString)}
                <PaymentText>
                    {inviteMsg(statusString, name, confirmed)}
                </PaymentText>
            </PayMsg>
        </InviteText>
        {dialogOpen && <InviteConfirm onConfirmHandler={onConfirmHandler} loading={loading} price={invite.price} handleCloseModal={()=>setDialogOpen(false)}/>}
    </Wrap>

}

function InviteConfirm({handleCloseModal, price, loading, onConfirmHandler}){

    return <Modal
    open={true}
    onClose={handleCloseModal}
    aria-labelledby="simple-modal-title"
    aria-describedby="simple-modal-description"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Content bg={theme.bg}>
            {`Pay ${price} sat for Invitation?`}
            <ButtonWrap>
                <Button onClick={handleCloseModal} color={'primary'} > Cancel</Button>
                <div style={{width: 20}}></div>
                <Button onClick={onConfirmHandler} loading={loading} color={'secondary'} style={{color: 'white'}}>Confirm</Button>                
            </ButtonWrap>
        </Content>
    </Modal>

}

function inviteIcon(statusString) {
    switch (statusString) {
      case 'payment_pending':
        return <PaymentIcon style={{ color: 'grey', marginRight: 5 }}/>
      case 'ready':
        return <CheckIcon style={{ color: '#64C684', marginRight: 5 }}/>
      case 'delivered':
        return <CheckIcon style={{ color: '#64C684', marginRight: 5 }}/>
      default:
        return <></>
    }
  }

function inviteMsg(statusString: string, name: string, confirmed?: boolean) {
    switch (statusString) {
      case 'pending':
        return `${name} is on the waitlist`
      case 'payment_pending':
        return confirmed ? 'Awaiting confirmation...' : 'Tap to pay and activate the invite'
      case 'ready':
        return 'Ready! Tap to share. Expires in 24 hours'
      case 'delivered':
        return 'Ready! Tap to share. Expires in 24 hours'
      case 'in_progress':
        return `${name} is signing on`
      case 'expired':
        return 'Expired'
      default:
        return 'Signup complete'
    }
  }

const Wrap = styled.div`
  cursor:pointer;
  width:100%;
  min-height:80px;
  display:flex;
  align-items:center;
  border-bottom:2px solid black;
  position:relative;
  z-index:10;
`

const QrCode = styled.div`
    margin-left: 30px;
    margin-right: 15px;
`

const InviteText = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:center;
  width:calc(100% - 88px);
  padding-right:14px;
`

const Name = styled.div`
  font-size:18px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`

const PaymentText = styled.div`
  margin-top:6px;
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:14px;
`

const PayMsg = styled.div`
  max-width:100%;
    color:grey;
    display: flex;
    flex-direction: row;
`

const InvitePrice = styled.div`
    position: absolute;
    right: 10px;
    top: 10px;
    height: 22px;
    color: white;
    background-color: #49ca98;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 3px;
    border-radius: 3px;
    font-size: 14px;
    margin-right: 10px;
`


const Content = styled.div`
  padding-top: 20px;
  padding-bottom: 20px;
  border-radius: 8px;
  width: 300px;
  background: ${p => p.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`

const ButtonWrap = styled.div`
    margin-top: 15px;
    display: flex;
    flex-direction: row;

`