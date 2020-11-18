import React from 'react'
import styled from 'styled-components'
import TextField from '@material-ui/core/TextField';

export default function TextAreaInput({ name, label, error, required, readOnly, handleChange, handleBlur, handleFocus, value, rows, style }) {
    return <Text
            id={name}
            value={value}
            label={required ? `${label}*` : label}
            onChange={e => handleChange(e.target.value)}
            onBlur={handleBlur}
            InputProps={{ readOnly, name }}
            onFocus={handleFocus}
            error={error ? true : false}
            variant="outlined"
            multiline
            rows={rows || 1}
            style={style || {marginTop: 10, marginBottom: 10}}
        />
}

const Text = styled(TextField)`
    display: flex;
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