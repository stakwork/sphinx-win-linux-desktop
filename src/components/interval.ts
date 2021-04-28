import { SendPaymentArgs, feedStore } from '../store/feed'
import TrackPlayer from 'react-native-track-player';


const interval = setInterval(tick, 1000)

let count = 0

export function pause(){
  args = null
}

async function tick(){
  if(!args) return
  const c = count
  if (c && c % NUM_SECONDS === 0) {
    try{
      const newText = JSON.parse(args.text)
      const pos = await TrackPlayer.getPosition()
      newText.ts = Math.round(pos)
      console.log("TICK PAY")
      console.log("C === ", c)
      feedStore.sendPayments({
        destinations: args.destinations,
        text: JSON.stringify(newText),
        amount: args.amount,
        chat_id: args.chat_id,
        update_meta: args.update_meta
      })
    } catch(e){}
  }
  count += 1
}

let args: SendPaymentArgs | null = null

export function setArgs(a:SendPaymentArgs | null) {
  args = a
}

export function getArgs(){
  return args
}

let NUM_SECONDS = 43200

export function setNumSeconds(n:number) {
  NUM_SECONDS = n
}
