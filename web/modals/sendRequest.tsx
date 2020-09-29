import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import { useStores } from '../../src/store'
import { makeStyles } from '@material-ui/core/styles';
import theme from '../theme'
import CallMadeIcon from '@material-ui/icons/CallMade';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import TextField from '@material-ui/core/TextField';
import { contactForConversation } from '../../src/store/hooks/chats'
import Button from '../utils/button'

export default function SendRequest() {
    const { ui, msg, details, contacts } = useStores()
    const [mode, setMode] = useState(``)
    const [inputAmt, setInputAmt] = useState(null)
    const [inputMsg, setInputMsg] = useState(``)
    const [loading, setLoading] = useState(false)
    const chat = ui.sendRequestModal

    const handleAmt = (e) => {
        if (mode === 'Send' && parseInt(e.target.value) > details.balance) {
            setInputAmt(details.balance)
        } else { setInputAmt(e.target.value) }
    };

    async function sendPayment(amt, text) {
        if (!amt) return
        setLoading(true)
        const contact = contactForConversation(chat, contacts.contacts)
        const contact_id = contact && contact.id
        await msg.sendPayment({
            contact_id: contact_id || null,
            amt,
            chat_id: (chat && chat.id) || null,
            destination_key: '',
            memo: text,
        })
        setLoading(false)
        ui.setSendRequestModal(null)
    }

    async function sendInvoice(amt, text) {
        if (!amt) return
        setLoading(true)
        const contact = contactForConversation(chat, contacts.contacts)
        const contact_id = contact && contact.id
        const inv = await msg.sendInvoice({
            contact_id: contact_id || null,
            amt,
            memo: text,
            chat_id: (chat && chat.id) || null,
        })
        setLoading(false)
        if (chat) ui.setSendRequestModal(null) // done (if in a chat)
        return inv
    }

    function sendRequestModalHandler() {
        ui.setSendRequestModal(null)
    }

    function onChangeMemoHandler(e: any) {
        setInputMsg(e.target.value)
    }

    function onConfirmHandler() {
        if (mode === 'Request') {
            sendInvoice(inputAmt, inputMsg)
        }
        if (mode !== 'Request') {
            sendPayment(inputAmt, inputMsg)
        }
    }

    if (mode) {
        return <Modal
            open={true}
            onClose={sendRequestModalHandler}
            className="view-img-modal-wrap"
        >
            <RequestContent bg={theme.bg}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                    <ClearRoundedIcon onClick={sendRequestModalHandler} style={{ color: '#4f565d', width: 25, height: 25 }} />
                    <div style={{ paddingTop: 5 }}>{mode === 'Request' ? 'REQUEST AMOUNT' : 'SEND PAYMENT'}</div>
                    <div style={{ width: 25, height: 25 }}></div>
                </div>
                <TextInputWrapper >
                    <TextField
                        id="amount"
                        label="Amount"
                        type="number"
                        placeholder="0"
                        value={inputAmt}
                        inputProps={{ style: { textAlign: 'center' } }}
                        onChange={handleAmt}
                    />
                    <Sats>sat</Sats>
                </TextInputWrapper>
                <TextInputWrapper >
                    <TextField
                        id="memo"
                        label="Memo"
                        multiline
                        rowsMax={4}
                        value={inputMsg}
                        onChange={onChangeMemoHandler}
                    />
                </TextInputWrapper>
                <Button color='primary' loading={loading} onClick={onConfirmHandler}>
                    CONFIRM
                </Button>
            </RequestContent>
        </Modal>
    }
    return <Modal
        open={true}
        onClose={sendRequestModalHandler}
        className="view-img-modal-wrap"
    >
        <Content bg={theme.bg}>
            <RowButton bg={theme.bg} onClick={() => setMode(`Request`)}>
                <CallReceivedIcon style={{ color: 'white', marginRight: 25, fontSize: 30 }} />
                Request
            </RowButton>
            <RowButton bg={theme.bg} onClick={() => setMode(`Send`)}>
                <CallMadeIcon style={{ color: 'white', marginRight: 25, fontSize: 30 }} />
                Send
            </RowButton>
            <Cancel bg={theme.bg} onClick={sendRequestModalHandler}>
                CANCEL
            </Cancel>
        </Content>
    </Modal>
}

const TextInputWrapper = styled.div`
    position: relative;
 & label {
    color: white;
 }
 & .MuiInput-underline:before {
    border-bottom: 1px solid white;
 }
 & .MuiInput-underline:hover:not(.Mui-Disabled):before{
     border-bottom: 1px solid white;
 }
 & .MuiInputBase-root{
     color: white;
 }
`

const Sats = styled.div`
    font-size: 22px;
    color: #677687;
    position: absolute;
    right: -35px;
    bottom: 4px;
`

const Content = styled.div`
    padding-top: 15px;
    border-radius: 8px;
    min-width: 300px;
    min-height: 175px;
    background: ${p => p.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const RequestContent = styled.div`
    padding: 10px;
    border-radius: 8px;
    min-width: 340px;
    min-height: 500px;
    background: ${p => p.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
`

const RowButton = styled.button`
    display: flex;
    align-items: center;
    height: 55px;
    width: 240px;
    background-color: ${p => p.bg};
    border: none;
    border-bottom: 1px solid #394652;
    font-size: 18px;
    color: white;
    font-weight: bold;
`

const Cancel = styled.button`
    height: 45px;
    width: 240px;
    background-color: ${p => p.bg};
    font-size: 12px;
    color: #ed7473;
    border: none;
    font-weight: bold;
`

const Confirm = styled.button`
    border-radius: 25px;
    height: 50px;
    width: 180px;
    color: white;
    background-color: #618af8;
    border: none;
    font-weight: bold;
`