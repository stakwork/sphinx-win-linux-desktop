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
  // {
  //   name:'photo',
  //   type:'photo',
  //   label:{
  //     en:'Profile Image',
  //     es:'Imagen'
  //   }
  // },
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
  },
  {
    name:'private_photo',
    type:'radio',
    inverted:true,
    label:{
      en:'Share your Profile Photo with Contacts'
    },
    required:false
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
    name:'img',
    type:'photoURI',
    label:{
      en:'Group Image',
      es:'Group Image'
    }
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
  {
    name:'tags',
    type:'tags',
    label:{
      en:'Tags',
      es:'Tags'
    },
    validator: Yup.array(),
  },
  {
    name:'price_to_join',
    type:'number',
    label:{
      en:'Price to Join',
      es:'Price to Join'
    },
    validator: Yup.number(),
  },
  {
    name:'price_per_message',
    type:'number',
    label:{
      en:'Price per Message',
      es:'Price per Message'
    },
    validator: Yup.number(),
  },
  {
    name:'escrow_amount',
    type:'number',
    label:{
      en:'Amount to Stake',
      es:'Amount to Stake'
    },
    validator: Yup.number(),
    description: 'A spam protection mechanism: every subscriber pays this fee for each message, which is returned to them after after the amount of hours specific in Escrow Time'
  },
  {
    name:'escrow_time',
    type:'number',
    label:{
      en:'Time to Stake (Hours)',
      es:'Time to Stake (Hours)'
    },
    validator: Yup.number(),
    description: 'The number of hours before the Escrow Amount is returned to the subscriber'
  },
]

export {
  contact, subscribe, me, tribe,
}

function emptyStringToNull(value, originalValue) {
  if (typeof originalValue === 'string' && originalValue === '') {
    return null;
  }
  return value;
}