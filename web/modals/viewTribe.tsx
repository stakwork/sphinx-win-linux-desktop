import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal';
import { useStores } from '../../src/store'
import theme from '../theme'
import styled from 'styled-components'
import Button from '../utils/button'
import { CircularProgress } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

export default function ViewTribe() {

    const { msg, ui, chats } = useStores()
    const tribe = ui.viewTribe
    const [loading, setLoading] = useState(false)
    const [alias, setAlias] = useState('')

    async function joinTribe() {
        setLoading(true)
        await chats.joinTribe({
            name: tribe.name,
            group_key: tribe.group_key,
            owner_alias: tribe.owner_alias,
            owner_pubkey: tribe.owner_pubkey,
            host: tribe.host || 'tribes.sphinx.chat',
            uuid: tribe.uuid,
            img: tribe.img,
            amount: tribe.price_to_join || 0,
            is_private: tribe.private,
            ...alias && { my_alias: alias }
        })
        setLoading(false)
        handleClose()
    }

    function handleClose() {
        ui.setViewTribe(null)
    }

    function millisToHours(millis) {
        return Math.floor((millis / (1000 * 60 * 60)) % 24);
    }

    const alreadyJoined = chats.chats.find(c => c.uuid === tribe.uuid)

    if (!tribe) {
        return <div></div>
    }
    return <Modal
        open={true}
        onClose={handleClose}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <Content bg={theme.bg}>
            <Header>JOIN TRIBE</Header>
            <Image style={{ backgroundImage: `url(${tribe.img})` }}></Image>
            <Title>{tribe.name}</Title>
            <Description grey={theme.greyText}>{tribe.description}</Description>
            <Details grey={theme.greyText}>
                <Row name={'Price to Join:'} value={tribe.price_to_join} />
                <Row name={'Price per Message:'} value={tribe.price_per_message} />
                <Row name={'Amount to Stake:'} value={tribe.escrow_amount} />
                <DetailRow style={{ border: 'none' }}>
                    <RowTitle>Time to Stake (hours):</RowTitle>
                    <RowContent>{millisToHours(tribe.escrow_millis)}</RowContent>
                </DetailRow>
            </Details>
            {!alreadyJoined && <AliasWrap>
                <TextField variant="outlined" style={{ marginBottom: 5, width: '100%' }}
                    label="My Name for this Tribe" type="text" value={alias}
                    inputProps={{ style: { textAlign: 'center' } }}
                    onChange={(e) => setAlias(e.target.value)}
                />
            </AliasWrap>}
            {alreadyJoined ?
                <Button color={'secondary'} style={{ marginTop: 20 }}
                    onClick={async () => {
                        console.log("SELECTD THIS CHAT", alreadyJoined)
                        msg.seeChat(alreadyJoined.id)
                        ui.setSelectedChat(alreadyJoined)
                        ui.toggleBots(false)
                        chats.checkRoute(alreadyJoined.id)
                        handleClose()
                    }}>
                    Already Joined!
                </Button> :

                <Button disabled={loading} onClick={joinTribe} color={'primary'} style={{ marginTop: 20 }}>
                    {loading && <CircularProgress size={14} />} Join Tribe
                </Button>
            }

        </Content>
    </Modal>

}

function Row({ name, value }) {
    return <DetailRow>
        <RowTitle>{name}</RowTitle>
        <RowContent>{value}</RowContent>
    </DetailRow>

}

const Content = styled.div`
    padding: 40px 20px;
    border-radius: 8px;
    width: 400px;
    min-height: 500px;
    background: ${p => p.bg};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
`
const Header = styled.div`
    margin-bottom: 15px;
`

const Image = styled.div`
    height: 100px;
    width: 100px;
    border-radius: 50%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
`

const Title = styled.div`
    font-size: 35px;
    margin: 15px 0px;
    text-align: center;
`

const Description = styled.div`
    display: flex;
    color: ${p => p.grey};
    margin: 15px 0px;
    text-align: center;
`

const Details = styled.div`
    border-width: 1px;
    border-radius: 6px;
    border-style: solid;
    border-color: ${p => p.grey};
    color: ${p => p.grey};
    padding: 10px 20px;
    width: 80%;
    margin: 15px 0px;
`

const DetailRow = styled.div`
    color: ${p => p.grey};
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid;
    padding: 10px 0px;
`

const RowTitle = styled.div`
    color: ${p => p.grey};
`

const RowContent = styled.div`
    color: ${p => p.grey};
`

const AliasWrap = styled.div`
    width: 80%;
`