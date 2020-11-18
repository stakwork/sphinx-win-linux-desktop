import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import styled from 'styled-components'
import Input from './inputs'
import Button from '../utils/button'

export default function Form(props){

    return <Formik initialValues={props.initialValues || {}} onSubmit={props.onSubmit} validationSchema={validator(props.schema)}>
        {({ setFieldTouched, handleSubmit, values, setFieldValue, errors, dirty, isValid}) => {
            return <Wrap>
                {props.schema && props.schema.map(item=>{
                    return <Input {...item}
                        key={item.name}
                        value={values[item.name]}
                        error={errors[item.name]}
                        handleChange={e=>setFieldValue(item.name, e)}
                        handleBlur={()=>setFieldTouched(item.name, false)}
                        handleFocus={()=>setFieldTouched(item.name, true)}
                    />
                })}
                <Button style={props.buttonStyle} color={props.buttonColor || 'primary'} loading={props.loading} onClick={handleSubmit} disabled={!isValid || !dirty}>{props.buttonText || "Save Changes"}</Button>
            </Wrap>
        }}
    </Formik>
}

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: space-evenly;
    height: 100%;
`

function validator(config){
    const shape = {}
    config.forEach((field)=>{
      if(typeof field === 'object') {
        shape[field.name] = field.validator
      }
    })
    return Yup.object().shape(shape)
  }