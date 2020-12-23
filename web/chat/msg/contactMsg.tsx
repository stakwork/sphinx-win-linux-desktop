import React, { useEffect, useState } from 'react'
import { useStores } from '../../../src/store'
import styled from 'styled-components'
import CircularProgress from '@material-ui/core/CircularProgress';
import { addContact } from '../../images'
import { qrTrans } from '../../images'
import theme from '../../theme'
import Button from '../../utils/button'

export default function ContactMsg(props) {

    const { ui, chats, msg, contacts } = useStores()
    const [loading, setLoading] = useState(false)

    const contactKeys = contacts.contacts.map(x => x.public_key)
    const contactAlready = contactKeys.includes(props.message_content)
    const userData = contacts.contacts.find(g => g.public_key === props.message_content)

    if (loading) return <Wrap><CircularProgress /></Wrap>
    return <Wrap>

        {contactAlready ?
            <KnownWrap>
                <ImageWrapper src={userData.photo_url || addContact}></ImageWrapper>
                <div>
                    <Name>{userData.alias}</Name>
                    <MsgCont>{props.message_content}</MsgCont>
                </div>
            </KnownWrap> :
            <UnknownWrap>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <ImageWrapper src={addContact}></ImageWrapper>
                    <div style={{paddingTop: 10}}>
                        <Name>New Contact</Name>
                        <MsgCont>{props.message_content}</MsgCont>
                    </div>
                </div>
                    <Button 
                    onClick={() => ui.setNewContact({pubKey: props.message_content})} 
                    color={"primary"}
                    style={{marginLeft: 50}}
                    >
                        Add Contact
                        </Button>
            </UnknownWrap>}

    </Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const KnownWrap = styled.div`
      display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

const UnknownWrap = styled.div`
      display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Name = styled.div`
    font-weight: bold;
    font-size: 20px;
`

const MsgCont = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    display: inline-block;
    width: 200px;
    margin-top: 10px;
`


const ImageWrapper = styled.div`
    background: url(${p => p.src}) no-repeat;
    background-size: 100%;
    background-position: center;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    overflow: hidden;
    color: #44505d;
    background-color: transparent;
    margin-right: 20px;
`