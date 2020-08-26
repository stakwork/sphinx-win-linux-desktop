import React, { useEffect } from 'react'
import { constants } from '../../../src/constants'
import { useStores } from '../../../src/store'
import styled from 'styled-components'
import { calcExpiry } from '../../../src/components/chat/msg/utils'
import { message } from '../../../src/store/websocketHandlers'
import Button from '@material-ui/core/Button';
import CallMadeIcon from '@material-ui/icons/CallMade';
import theme from '../../theme'

export default function InvoiceMsg(props) {
    const { ui } = useStores()
    const { amount } = props
    const isMe = props.sender === 1
    const isPaid = props.status === constants.statuses.confirmed
    const { isExpired } = calcExpiry(props)

    let label = isMe ? 'REQUEST SENT' : 'REQUEST'
    let color = '#555'
    let opacity = 1
    if (isPaid) {
        color = isMe ? '#555' : '#74ABFF'
        label = `INVOICE PAID`
    } else { // if unpaid, check expiry
        if (isExpired) opacity = 0.35
    }

    const showPayButton = !isPaid && !isMe
    const hasContent = props.message_content ? true : false

    function openConfirmModal() {
        const checkAgain = calcExpiry(props)
        if (!checkAgain.isExpired) {
            ui.setConfirmInvoiceMsg(props)
        }
    }

    return <Wrap bg={theme.bg} isPaid={isPaid}>
        <Label>{label}</Label>
        <Top>
            <svg aria-hidden="true" focusable="false" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                <path d="M3 11h2v2H3v-2m8-6h2v4h-2V5m-2 6h4v4h-2v-2H9v-2m6 0h2v2h2v-2h2v2h-2v2h2v4h-2v2h-2v-2h-4v2h-2v-4h4v-2h2v-2h-2v-2m4 8v-4h-2v4h2M15 3h6v6h-6V3m2 2v2h2V5h-2M3 3h6v6H3V3m2 2v2h2V5H5M3 15h6v6H3v-6m2 2v2h2v-2H5z" fill="white" />
            </svg>
            <Amount>{amount}</Amount>
            <Sat>sat</Sat>
        </Top>
        {hasContent && <Message>{props.message_content}</Message>}
        {showPayButton && <Button disabled={isExpired} onClick={() => openConfirmModal()}
            style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', color: 'white', backgroundColor: isExpired ? '#7f7f7f' : '#4AC998', width: '100%', borderRadius: 5, cursor: 'pointer', marginTop: 10 }}
        >
            <div></div><div style={{ marginLeft: 15 }}>{isExpired ? 'Expired' : 'Pay'}</div>
            <CallMadeIcon style={{ backgroundColor: 'white', color: isExpired ? '#7f7f7f' : '#4AC998', borderRadius: 5, fontSize: 'medium', height: 20, width: 20 }} />
        </Button>}
    </Wrap>
}

const Wrap = styled.div`
    background: ${p => p.bg};
    min-width:250px;
    max-width:250px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    border: ${p => p.isPaid ? `` : `2px dashed #4AC998`};
`
const Top = styled.div`
    display: flex;
    flex-direction: row;
`
const Label = styled.div`
    margin-bottom: 5px;
    color:#74ABFF;
    position: relative;
    font-size:10px;
    margin-right: 20px;
`
const Amount = styled.div`
    color:white;
    position: relative;
    font-size:16px;
    font-weight: bold;
    margin-right: 8px;
    margin-left: 10px;
`
const Sat = styled.div`
    color:#829cba;
    position: relative;
    font-size:16px;
`
const Message = styled.div`
    color: white;
    font-size: 16px;
    margin-top: 5px;
`
const Invoice = styled.div`
    color: #7f7f7f;
    font-size: 16px;
    margin-top: 5px;
`