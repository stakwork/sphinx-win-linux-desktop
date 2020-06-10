import React, {useEffect} from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Formik } from 'formik'
import { Button } from 'react-native-paper'
import Input from './inputs'
import * as Yup from 'yup'

export default function Form(props) {
  if(!props.schema) return <Text>please provide schema</Text>
  return (
    <Formik
      initialValues={props.initialValues||{}}
      onSubmit={values=> props.onSubmit(values)}
      validationSchema={validator(props.schema)}
      validateOnChange={false}>
      {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, dirty, isValid }) => {
        return (<View style={styles.wrap}>
          <View style={styles.topper}>
            {props.schema.map(item=>{
              const readOnly = props.readOnlyFields && props.readOnlyFields.includes(item.name)
              return <Input key={item.name} {...item} 
                value={values[item.name]}
                displayOnly={props.displayOnly||readOnly}
                handleChange={handleChange} 
                handleBlur={handleBlur} 
                setValue={data=> setFieldValue(item.name,data)} 
                error={errors[item.name]}
              />
            })}
          </View>
          {!props.displayOnly && <View style={styles.buttonWrap}>
            <Button mode="contained"
              onPress={handleSubmit} 
              disabled={!props.forceEnable && (!dirty || !isValid)}
              dark={true} style={styles.button} loading={props.loading}>
              {props.buttonText||'Submit'}
            </Button>
          </View>}
        </View>)
      }}
    </Formik>
  )
}

function validator(config){
  const shape = {}
  config.forEach((field)=>{
    if(typeof field === 'object') {
      shape[field.name] = field.validator
    }
  })
  return Yup.object().shape(shape)
}

const styles=StyleSheet.create({
  wrap:{
    flex:1,
    width:'100%',height:'100%',
    justifyContent:'space-between',
    position:'relative',
    minHeight:420
  },
  topper:{
    width:'100%',
    flex:1,
    padding:25,
    paddingBottom:75,
  },
  buttonWrap:{
    width:'100%',
    maxHeight:60,
    flexDirection:'row-reverse',
    justifyContent:'center',
    position:'absolute',
    bottom:10,left:0,right:0,
    zIndex:1000
  },
  button:{
    borderRadius:30,
    width:'80%',
    height:60,
    display:'flex',
    justifyContent:'center',
    zIndex:999,
    position:'relative',
  }
})