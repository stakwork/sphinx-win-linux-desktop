import React, { useState, useEffect } from 'react'
import { useStores } from '../../src/store'
import styled, { css } from 'styled-components'
import Modal from '@material-ui/core/Modal';
import theme from '../theme'
import Form from '../form'
import * as Yup from 'yup'
import Button from '../utils/button'

const newSchema = [{
    name: 'name',
    type: 'textArea',
    label: 'Nickname',
    validator: Yup.string().required('Required'),
    style: {
        marginTop: 10,
    }
}, {
    name: 'message',
    type: 'textArea',
    label: 'Include A Message',
    rows: 4,
    style: {
        marginTop: 10,
    }
}]

const alreadySchema = [{
    name: 'name',
    type: 'textArea',
    label: 'Nickname',
    validator: Yup.string().required('Required'),
}, {
    name: 'address',
    type: 'textArea',
    label: 'Address',
    validator: Yup.string().required('Required'),
}]

export default function NewContact() {

    const { ui, contacts, details, user } = useStores()
    const [contactState, setContactState] = useState('')
    const [price, setPrice] = useState('')

    useEffect(() => {
        (async () => {
            const price = await contacts.getLowestPriceForInvite()
            console.log("PRICE", price)
            if (price || price === 0) setPrice(price)
        })()
    }, [])


    function handleCloseModal() {
        ui.setNewContact(false)
        setContactState('')
    }
    return <Modal
        open={true}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        {!contactState ?
            <Content bg={theme.bg}>
                <Title>Add Contact</Title>
                <Button style={{ marginTop: 20, color: 'white', height: '45px', width: '220px', backgroundColor: theme.secondary }}
                    onClick={() => setContactState('new')}>
                    New to Sphinx</Button>
                <Button style={{ marginTop: 20, color: 'white', height: '45px', width: '220px', backgroundColor: theme.primary }}
                    onClick={() => setContactState('already')}>
                    Already on Sphinx</Button>
            </Content>
            :
            <Content contactState={contactState} bg={theme.bg}>
                <Title>{contactState === 'new' ? 'New Contact' : 'Add User'}</Title>
                {contactState === 'new' ?
                    <div>
                        <Form
                            onSubmit={v => console.log(v)}
                            schema={newSchema}
                            buttonColor={'secondary'}
                            buttonText={'Create Invitation'}
                            buttonStyle={{
                                marginTop: 10
                            }}
                            />
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', color: '#6a7a8c', marginTop: 5 }}>
                            Estimated Cost:&nbsp; <span style={{color: 'white'}}>{price}</span> &nbsp;SAT
                        </div>
                    </div> :
                    <div>
                        <Form
                            onSubmit={v => console.log(v)}
                            schema={alreadySchema}
                            buttonText={'Save To Contacts'} />
                    </div>
                }
            </Content>
        }

    </Modal>

}

const Content = styled.div`
    color: white;
    padding: 30px 0;
    border-radius: 8px;
    background: ${p => p.bg};
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
`

const Title = styled.div`
    font-size: 25px;
    border-bottom: 1px solid;
`