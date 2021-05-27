var http = require('ava-http');
var h = require('./helpers')

async function appRejMember(t, admin, contactID, msgId, status){
    //NODE1 APPROVE OR REJECT NODE2 ===>

    //status === "approved" or "rejected"
    //contactID === member awaiting approval
    //msgId === join message id

    const appRej = await http.put(admin.ip+`/member/${contactID}/${status}/${msgId}`, h.makeArgs(admin))
    t.truthy(appRej)
    // console.log("APPREJ === ", JSON.stringify(appRej))


    
      return true
    
    }

module.exports = appRejMember