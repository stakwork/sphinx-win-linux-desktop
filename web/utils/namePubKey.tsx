import React, {useState} from 'react'
import styled from 'styled-components'
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';

export default function NamePubKey(props){

    const [alert, setAlert] = useState(``)

    function onCopy(word) {
        setAlert(`${word} copied to clipboard`)
        setTimeout(() => {
          setAlert(``)
        }, 2000);
      }

    return <Content>
              <AliasFieldWrapper>
            <TextField
          id="alias"
          label="Nickname"
          defaultValue={props.alias}
          InputProps={{
            readOnly: true,
          }}
          onClick={() => { navigator.clipboard.writeText(props.alias), onCopy('Nickname')}}
        />
        </AliasFieldWrapper>
        <PubkeyFieldWrapper>
                <TextField
          id="pubkey"
          label="Address"
          defaultValue={props.public_key}
          InputProps={{
            readOnly: true,
          }}
          onClick={() => { navigator.clipboard.writeText(props.public_key), onCopy('Address')}}
        />
            </PubkeyFieldWrapper>
            {alert && <Alert style={{ position: 'absolute', bottom: 200, left: 'calc(50% - 100px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
    </Content>
}

const Content = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
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