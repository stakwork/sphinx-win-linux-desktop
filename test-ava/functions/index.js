var addContact = require('./add-contact')
var checkDecrypt = require('./check-decrypt')
var createTribe = require('./create-tribe')
var deleteChat = require('./delete-chat')
var deleteContacts = require('./delete-contacts')
var deleteTribe = require('./delete-tribe')
var getChats = require('./get-chats')
var getContacts = require('./get-contacts')
var getSelf = require('./get-self')
var getTribeId = require('./get-tribe-id')
var joinTribe = require('./join-tribe')
var leaveTribe = require('./leave-tribe')
var sendImage = require('./send-image')
var sendMessage = require('./send-message')
var sendTribeMessage = require('./send-tribe-message')
var sendPayment = require('./send-payment')
var sendInvoice = require('./send-invoice')
var payInvoice = require('./pay-invoice')
var getCheckContacts = require('./get-check-contacts')
var getCheckNewMsgs = require('./get-check-newMsgs')
var getCheckNewPaidMsgs = require('./get-check-newPaidMsgs')
var getCheckTribe = require('./get-check-tribe')
var sendEscrowMsg = require('./send-escrow-message')
var getBalance = require('./get-balance')

module.exports = {
    addContact,
    checkDecrypt,
    createTribe,
    deleteChat,
    deleteContacts,
    deleteTribe,
    getChats,
    getContacts,
    getSelf,
    getTribeId,
    joinTribe,
    leaveTribe,
    sendImage,
    sendMessage,
    sendTribeMessage,
    sendPayment,
    sendInvoice,
    payInvoice,
    getCheckContacts,
    getCheckNewMsgs,
    getCheckNewPaidMsgs,
    getCheckTribe,
    sendEscrowMsg,
    getBalance,
}