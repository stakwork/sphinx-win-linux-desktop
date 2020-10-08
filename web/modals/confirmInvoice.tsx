import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import { useStores } from '../../src/store'
import theme from '../theme'
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CancelIcon from '@material-ui/icons/Cancel';

export default function ConfirmInvoice({ params }) {
    const { ui, msg } = useStores()
    const [loading, setLoading] = useState(false)
    const { amount } = params

    async function pay() {
        const req = ui.confirmInvoiceMsg && ui.confirmInvoiceMsg.payment_request
        if (!req) return
        setLoading(true)
        await msg.payInvoice(ui.confirmInvoiceMsg)
        setLoading(false)
        ui.setConfirmInvoiceMsg(null)
    }

    function setConfirmInvoiceMsgHandler() {
        ui.setConfirmInvoiceMsg(null)
    }

    return <Modal
        open={true}
        onClose={setConfirmInvoiceMsgHandler}
        className="view-img-modal-wrap"
    >
        <Content bg={theme.bg}>
            <Title>Confirm</Title>
            <Message>Do you want to pay this invoice for {amount} sats?</Message>
            <Buttons>
                <Button onClick={setConfirmInvoiceMsgHandler} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.bg, backgroundColor: '#7f7f7f', width: 125 }}>
                    Cancel
                    <CancelIcon style={{ color: theme.bg, marginLeft: 10 }} />
                </Button>
                <Button disabled={loading} onClick={pay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: '#4AC998', width: 125 }}>
                    <div>Confirm</div>
                    <div style={{ display: 'flex', height: 20, marginTop: 2 }}>
                        {!loading ? <CallMadeIcon style={{ backgroundColor: 'white', color: '#4AC998', borderRadius: 5, fontSize: 'medium', height: 20, width: 20, marginLeft: 10 }} />
                            : <CircularProgress style={{ height: 20, width: 20, marginLeft: 10 }} />}
                    </div>
                </Button>
            </Buttons>
        </Content>
    </Modal>
}

const Content = styled.div`
    padding: 25px;
    border-radius: 8px;
    min-width: 250px;
    min-height: 120px;
    background: ${p => p.bg};
    display: flex;
    flex-direction: column;
`
const Title = styled.div`
    display: flex;
    justify-content: left;
    margin-bottom: 20px;
    font-size: 18px;
    margin-left: 10px;
`

const Message = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    margin-right: 10px;
    margin-left: 10px;
    font-size:14px;
`

const Buttons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin-top: 10px;
`