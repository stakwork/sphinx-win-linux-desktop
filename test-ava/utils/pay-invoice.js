var http = require('ava-http');
var h = require('./helpers')
var getBalance = require('./get/get-balance')
var getCheckNewPaidInvoice = require('./get/get-check-newPaidInvoice')

async function payInvoice(t, node1, node2, amount, payment_request){
//PAY INVOICE FROM NODE1 TO NODE2 ===>

    //get node1 balance before payment
    const node1beforeBalance = await getBalance(t, node1)
    //get node2 balance before payment
    const node2beforeBalance = await getBalance(t, node2)

    const v = { payment_request }
    const r = await http.put(node1.ip+'/invoices', h.makeArgs(node1, v))
    // console.log("PAYMENT REQUEST === ", JSON.stringify(payment_request))
    // console.log("INVOICE === ", JSON.stringify(r))
    t.true(r.success, "Put method should have succeeded")
    const paymentHash = r.response.payment_hash
    t.truthy(paymentHash, "paymentHash should exist")

    //wait for PUT method
    const paid = await getCheckNewPaidInvoice(t, node2, paymentHash)
    t.truthy(paid, "node2 should see payment")

    //get node1 balance after payment
    const node1afterBalance = await getBalance(t, node1)
    //get node2 balance after payment
    const node2afterBalance = await getBalance(t, node2)

    console.log("amount", amount)
    console.log("NODE1 === ", (node1beforeBalance - node1afterBalance))
    console.log("NODE2 === ", (node2afterBalance - node2beforeBalance))

    //check that node1 sent payment and node2 received payment based on balances
    //3 SAT ARE ADDED AS A MESSAGE FEE
    t.true((node1beforeBalance - node1afterBalance) >= amount, "node1 should have paid amount")
    t.true((node2beforeBalance - node2afterBalance) <= amount - 3, "node2 should have received amount")

    
    return true
}

module.exports = payInvoice