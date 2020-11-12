import React from 'react'
import styled from 'styled-components'
import TextField from '@material-ui/core/TextField';

export default function TextInput({ name, label, error, required, readOnly, handleChange, handleBlur, handleFocus, value, style }) {
    return <Text
            id={name}
            value={value}
            label={required ? `${label}*` : label}
            onChange={e => handleChange(e.target.value)}
            onBlur={handleBlur}
            InputProps={{ readOnly, name }}
            onFocus={handleFocus}
            error={error ? true : false}
            style={style||{marginTop:18,marginBottom:18}}
        />
}

const Text = styled(TextField)`
    display: flex;
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