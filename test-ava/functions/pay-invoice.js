var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function payInvoice(t, node1, node2, amount, payment_request){
//PAY INVOICE FROM NODE1 TO NODE2 ===>

    //get node1 balance before payment
    var node1bal = await http.get(node1.ip+'/balance', h.makeArgs(node1))
    t.true(node1bal.success, "should get node1 balance")
    const node1beforeBalance = node1bal.response.balance

    //get node2 balance before payment
    var node2bal = await http.get(node2.ip+'/balance', h.makeArgs(node2))
    t.true(node2bal.success, "should get node2 balance")
    const node2beforeBalance = node2bal.response.balance

    const v = { payment_request }
    const r = await http.put(node1.ip+'/invoices', h.makeArgs(node1, v))
    t.true(r.success, "Put method should have succeeded")

    //wait for PUT method
    h.sleep(1000)

    //get node1 balance after payment
    node1bal = await http.get(node1.ip+'/balance', h.makeArgs(node1))
    t.true(node1bal.success, "should get node1 balance")
    const node1afterBalance = node1bal.response.balance

    //get node2 balance after payment
    node2bal = await http.get(node2.ip+'/balance', h.makeArgs(node2))
    t.true(node2bal.success, "should get node2 balance")
    const node2afterBalance = node2bal.response.balance

    //check that node1 sent payment and node2 received payment based on balances
    //3 SAT ARE ADDED AS A MESSAGE FEE
    t.true((node1beforeBalance - amount) === node1afterBalance, "node1 should have paid amount")
    t.true((node2beforeBalance + amount + 3) === node2afterBalance, "node2 should have received amount")

    
    return true
}

module.exports = payInvoice