import * as Yup from 'yup'
const rq = 'Required'

const contact = [
  {
    name:'alias',
    type:'text',
    label:{
      en:'Name',
      es:'Nombre'
    },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name:'photo',
    type:'photo',
    label:{
      en:'Profile Image',
      es:'Imagen'
    }
  },
  {
    name:'public_key',
    type:'pubkey',
    label:{
      en:'Address'
    },
    required: true,
    validator: Yup.string().required(rq),
  }
]

const me = [
  {
    name:'alias',
    type:'text',
    label:{
      en:'Name',
      es:'Nombre'
    },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name:'public_key',
    type:'pubkey',
    label:{
      en:'Address'
    },
    required: true,
    validator: Yup.string().required(rq),
  }
]

const subscribe = [

]

export {
  contact, subscribe, me,
}