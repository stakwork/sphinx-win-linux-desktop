

import { useStores } from '../index'

export function useIncomingPayments(podID) {
  const { msg } = useStores()
  let earned = 0
  let spent = 0
  let incomingPayments = []
  if (podID) {
    incomingPayments = msg.filterMessagesByContent(0, `"feedID":${podID}`)
    if (incomingPayments) {
      incomingPayments.forEach((m) => {
        if (m.sender !== 1 && m.amount) {
          earned += Number(m.amount)
        }
        if (m.sender === 1 && m.amount) {
          spent += Number(m.amount)
        }
      })
    }
    // console.log(earned)
  }
  return {earned,spent,incomingPayments}
}