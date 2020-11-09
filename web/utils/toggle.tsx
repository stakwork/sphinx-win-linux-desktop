import React, { useState } from 'react'
import styled from 'styled-components'
import theme from '../theme'


export default function Toggle(props){
    const {onChange, items, value} = props

    return <Wrap bg={theme.bg}>
        {items && items.map((item, i)=>{
            const selected = item === value
            return <Toggles selected={selected} onClick={()=>onChange(item)} key={i}>{item}</Toggles>
        })}
    </Wrap>
}

const Wrap = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`

const Toggles = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: .5px solid #6b7b8d;
    flex: 1;
    height: 35px;
    background-color: ${p=>p.selected?'#618bff':p.bg}
`