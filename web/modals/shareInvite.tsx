import React, { useState, useEffect } from 'react'
import { useStores } from '../../src/store'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
var QRCode = require('qrcode.react');
import Alert from '@material-ui/lab/Alert';

export default function ShareInvite() {

    const { ui, contacts, details, user } = useStores()
    const [alert, setAlert] = useState(``)


    function onCopy(word) {
        setAlert(`${word} copied to clipboard`)
        setTimeout(() => {
            setAlert(``)
        }, 2000);
    }

    function handleCloseModal() {
        ui.setShareInviteModal('')
    }

    return <Modal
        open={true}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Content>
            <Title>
                Share Invitation Code
            </Title>
            <CopyClick onClick={() => { navigator.clipboard.writeText(ui.shareInviteString), onCopy('Code') }}>
                Click to Copy
                </CopyClick>
            <Qr>
                <QRCode value={ui.shareInviteString} />
            </Qr>
            <Text onClick={() => { navigator.clipboard.writeText(ui.shareInviteString), onCopy('Code') }}>
                {ui.shareInviteString}
            </Text>
            {alert && <Alert
                style={{ position: 'absolute', bottom: '50%', left: 'calc(50% - 90px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }}
                icon={false}>{alert}
            </Alert>}
        </Content>
    </Modal>
}

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
`

const Title = styled.div`
    color: white;
    font-size: 20px;

`

const CopyClick = styled.div`

`

const Qr = styled.div`

`

const Text = styled.div`

`