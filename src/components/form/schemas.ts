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

const tribe = [
  {
    name:'name',
    type:'text',
    label:{
      en:'Name',
      es:'Nombre'
    },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name:'description',
    type:'text',
    label:{
      en:'Description',
      es:'Description'
    },
    required: true,
    validator: Yup.string().required(rq),
  },
]

export {
  contact, subscribe, me, tribe,
}