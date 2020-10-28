import React, { useState } from 'react'
import { useStores } from '../../src/store'
import styled from 'styled-components'
import Modal from '@material-ui/core/Modal';
import theme from '../theme'
import TextField from '@material-ui/core/TextField';
import QRCode from 'qrcode.react'
import Alert from '@material-ui/lab/Alert';

export default function ViewContact() {

    const { ui, msg, details, contacts } = useStores()
    const [alert, setAlert] = useState(``)
    const contact = ui.viewContact
    console.log(contact)

    function handleCloseModal() {
        ui.setViewContact(null)
    }

    function onCopy(word) {
        setAlert(`${word} copied to clipboard`)
        setTimeout(() => {
          setAlert(``)
        }, 2000);
      }

    return <Modal
        open={true}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <Content bg={theme.bg}>
            <ImageWrapper src={contact.photo_url}>
            </ImageWrapper>
            <AliasFieldWrapper>
            <TextField
          id="alias"
          label="Nickname"
          defaultValue={contact.alias}
          InputProps={{
            readOnly: true,
          }}
          onClick={() => { navigator.clipboard.writeText(contact.alias), onCopy('Nickname')}}
        />
        </AliasFieldWrapper>
        <PubkeyFieldWrapper>
                <TextField
          id="pubkey"
          label="Address"
          defaultValue={contact.public_key}
          InputProps={{
            readOnly: true,
          }}
          onClick={() => { navigator.clipboard.writeText(contact.public_key), onCopy('Address')}}
        />
            </PubkeyFieldWrapper>
            <QRCode style={{marginTop: '10px', border: '10px solid white'}} value={contact.public_key} />
            {alert && <Alert style={{ position: 'absolute', bottom: 200, left: 'calc(50% - 100px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
        </Content>
    </Modal>
}

const Content = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 8px;
    width: 300px;
    height: 450px;
    background: ${p => p.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
`

const ImageWrapper = styled.div`
    background: url(${p => p.src}) no-repeat;
    background-size: 100%;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    overflow: hidden;
    background-color: black;
`

const AliasFieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: space-around;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

 & .MuiFormLabel-root{
     color: white;
 }
 & .MuiInputBase-input{
    color: white;
 }
 &  .MuiInput-input{
     color: white;
 }
 & .MuiInput-underline:before {
    border-bottom: 1px solid white;
 }
 & .MuiInput-underline:hover:not(.Mui-Disabled):before{
     border-bottom: 1px solid white;
 }
`

const PubkeyFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-around;
 & .MuiFormLabel-root{
     color: white;
 }
 & .MuiInputBase-input{
    color: white;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
 }
 &  .MuiInput-input{
     color: white;
 }
 & .MuiInput-underline:before {
    border-bottom: 1px solid white;
 }
 & .MuiInput-underline:hover:not(.Mui-Disabled):before{
     border-bottom: 1px solid white;
 }
`