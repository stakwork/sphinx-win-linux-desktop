interface CalcBotPriceResponse {
  price:number,
  failureMessage:string,
}

// function calcBotPrice(bots,text){
export function calcBotPrice(bots:Array<BotJSON>,text:string): CalcBotPriceResponse{
  let price = 0
  let failureMessage = ''
  bots.forEach(b=>{
    if(!text.startsWith(b.prefix)) return // skip this bot if not right prefix
    if(b.price && b.price>0) {
      price = b.price
    }
    if(b.commands && Array.isArray(b.commands)) {
      const arr = text.split(' ') // array of words in the message
      if(arr.length<2) return
      b.commands.forEach(cmd=>{
        const theCommand = arr[1] // the "command" is the second item in the array
        if(cmd.command!=='*' && theCommand!==cmd.command) return // skip if wrong command (* means any)
        
        if(cmd.price) { // get the price from the command config
          price = cmd.price
        }
        else if(cmd.price_index) { // calculate the price from the actual command text
          if(arr.length-1 < cmd.price_index) return // skip if not enough words in the message
          const amount = parseInt(arr[cmd.price_index])
          if(cmd.min_price && amount<cmd.min_price) {
            failureMessage = 'Amount too low' // min amount
            return
          }
          if(cmd.max_price && amount>cmd.max_price) {
            failureMessage = 'Amount too high' // max amount
            return
          }
          price = amount
        }
      })
    }
  })
  return {price, failureMessage}
}

interface BotJSON {
  prefix: string,
  price: number,
  commands: BotCommand[] | null,
}
interface BotCommand {
  command: string,
  price: number,
  min_price: number,
  max_price: number,
  price_index: number,
  admin_only: boolean,
}

function testCalcBotPrice(txt){
  const res = calcBotPrice([{
    prefix: '/loopout',
    price: 0,
    commands: [{
      command: '*',
      price: 0,
      min_price: 250000,
      max_price: 16777215,
      price_index: 2,
      admin_only: false
    }]
  }], txt)
  console.log(res)
}
