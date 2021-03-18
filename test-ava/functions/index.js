var addContact = require('./add-contact')
var checkDecrypt = require('./check-decrypt')
var createTribe = require('./create-tribe')
var deleteChat = require('./delete/delete-chat')
var deleteContacts = require('./delete/delete-contacts')
var deleteTribe = require('./delete/delete-tribe')
var getChats = require('./get/get-chats')
var getContacts = require('./get/get-contacts')
var getSelf = require('./get/get-self')
var getTribeId = require('./get/get-tribe-id')
var joinTribe = require('./join-tribe')
var leaveTribe = require('./leave-tribe')
var sendImage = require('./send/send-image')
var sendMessage = require('./send/send-message')
var sendTribeMessage = require('./send/send-tribe-message')
var sendPayment = require('./send/send-payment')
var sendInvoice = require('./send/send-invoice')
var payInvoice = require('./pay-invoice')
var getCheckContacts = require('./get/get-check-contacts')
var getCheckNewMsgs = require('./get/get-check-newMsgs')
var getCheckNewPaidMsgs = require('./get/get-check-newPaidMsgs')
var getCheckNewPaidInvoice = require('./get/get-check-newPaidInvoice')
var getCheckTribe = require('./get/get-check-tribe')
var sendEscrowMsg = require('./send/send-escrow-message')
var getBalance = require('./get/get-balance')
var payStream = require('./pay-stream')
var getCheckNewStream = require('./get/get-check-newStream')
var sendBoost = require('./send/send-boost')
var getNewMessages = require('./get/get-newMsgs')
var botCreate = require('./bots/bot-create')
var botDelete = require('./bots/bot-delete')
var getTribeBots = require('./bots/get-tribe-bots')
var getCheckBotMsg = require('./get/get-check-botMsg')
var botDecrypt = require('./bots/bot-decrypt')
var getBots = require('./bots/get-bots')
var updateProfile = require('./update-profile')

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
    getCheckNewPaidInvoice,
    getCheckTribe,
    sendEscrowMsg,
    getBalance,
    payStream,
    getCheckNewStream,
    sendBoost,
    getNewMessages,
    botCreate,
    botDelete,
    getTribeBots,
    getCheckBotMsg,
    botDecrypt,
    getBots,
    updateProfile,
}