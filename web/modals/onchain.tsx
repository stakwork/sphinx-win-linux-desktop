import React, { useState, useEffect } from 'react'
import { useStores } from '../../src/store'
import styled, { css } from 'styled-components'
import Modal from '@material-ui/core/Modal';
import theme from '../theme'
import Alert from '@material-ui/lab/Alert';


export default function Onchain() {
    const { ui } = useStores()
    const { queries } = useStores()
    const [address, setAddress] = useState("")
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState("")

    async function getAddress() {
        const a = await queries.onchainAddress('bitcoin')
        setAddress(a)
        setLoading(false)
    }

    function handleCloseModal() {
        ui.setOnchain(false)
    }

    function onCopy(address) {
        if(loading) return
        setAlert(`Address copied to clipboard`)
        setTimeout(() => {
            setAlert(``)
        }, 2000);
    }

    useEffect(() => {
        getAddress()
    }, []);

    return <Modal
        open={true}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <Content bg={theme.bg}>
            <div style={{fontSize: 20, marginBottom: 10}}>Bitcoin Address:</div>
            <Input
                bg={theme.bg}
                textColor={theme.greyText}
                readOnly
                value={loading ? "loading..." : address}
                onClick={() => {navigator.clipboard.writeText(address), onCopy(address)}}
                disabled={loading}
            >
            </Input>
            <div
                style={{color: theme.greyText}}
                >
                Click to Copy 
            </div>
            {alert && <Alert style={{ position: 'absolute', bottom: 70, left: 'calc(50% - 100px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
            <Text>Please send between 0.0005 and 0.005 Bitcoin.</Text>
            <Text>After the transaction is confirmed, it will be added to your account.</Text>
        </Content>
    </Modal>
}

const Content = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
  width: 310px;
  background: ${p => p.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 30px 0px;
  min-height: 300px;
`

const Input = styled.input`
    cursor: pointer;
    background-color: ${p => p.bg};
    color: white;
    padding: 5px;
    border: .5px solid ${p => p.textColor};
    text-overflow: ellipsis;
    height: 30px;
    width: 200px;
`

const Text = styled.div`
    width: 80%;
    margin-top: 30px;
`