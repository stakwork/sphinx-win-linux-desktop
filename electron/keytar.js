const keytar = require('keytar')
const os = require("os");

const keytarService = "SphinxElectron";
const keytarAccount = os.userInfo().username || '_';

function setPrivateKey(pk){
    return keytar.setPassword(keytarService, keytarAccount, pk);
}
function getPrivateKey(){ // returning a Promise
    return keytar.getPassword(keytarService, keytarAccount);
}

module.exports = {getPrivateKey,setPrivateKey}