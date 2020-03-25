import moment from 'moment'
import { constants } from '../../../constants'

export function calcExpiry(props){
  const isInvoice = props.type===constants.message_types.invoice
  let expiry
  let isExpired = false
  if(isInvoice){
    const exp = moment(props.expiration_date)
    const dif = exp.diff(moment()) 
    expiry = Math.round(moment.duration(dif).asMinutes())
    if(expiry<0) isExpired=true
  }
  return {expiry, isExpired}
}