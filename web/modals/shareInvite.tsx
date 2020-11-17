import React, { useState, useEffect } from 'react'
import { useStores } from '../../src/store'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import theme from '../theme'
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
        ui.clearShareInviteModal()
    }

    return <Modal
        open={true}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Content bg={theme.bg}>
            <Title>
                SHARE INVITATION CODE
            </Title>
            <CopyWrap onClick={() => { navigator.clipboard.writeText(ui.shareInviteString), onCopy('Code') }}>
                <CopyClick>
                CLICK TO COPY
                </CopyClick>
            <Qr>
                <QRCode value={ui.shareInviteString} />
            </Qr>
            <Text >
                {ui.shareInviteString}
            </Text>  
            </CopyWrap>
            {alert && <Alert
                style={{ position: 'absolute', bottom: '35%', left: 'calc(50% - 90px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }}
                icon={false}>{alert}
            </Alert>}
        </Content>
    </Modal>
}

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${p => p.bg};
    padding-top: 40px;
    padding-bottom: 40px;
    border-radius: 8px;
`

const CopyWrap = styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const Title = styled.div`
    color: white;
    font-size: 20px;
    font-weight: bold;
`

const CopyClick = styled.div`
    margin-top: 30px;
    font-size: 14px;
    color: #5e6e7d;
`

const Qr = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    margin-top: 15px;
`

const Text = styled.div`
    width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 15px;
    color: #5e6e7d;
`