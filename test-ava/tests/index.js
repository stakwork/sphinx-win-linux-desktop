var checkSelf = require('./test-01-checkSelf')
var queryRoutes = require('./test-01-queryRoutes')
var contactTest = require('./test-02-contactTest')
var imageTest = require('./test-03-imageTest')
var joinTribe = require('./test-04-joinTribe')
var tribeImages = require('./test-05-tribeImages')
var paidImages = require('./test-06-paidImages')
var paidMsgs = require('./test-07-paidMsgs')
var chatPayment = require('./test-08-chatPayment')
var chatInvoice = require('./test-09-chatInvoice')
var tribe3Msgs = require('./test-10-tribe3Msgs')
var tribe3Imgs = require('./test-11-tribe3Imgs')
var tribe3Escrow = require('./test-12-tribe3Escrow')
var tribe3Private = require('./test-13-tribe3Private')
var tribe3Profile = require('./test-14-tribe3Profile')
var tribeEdit = require('./test-15-tribeEdit')
var streamPayment = require('./test-20-streamPayment')
var boostPayment = require('./test-21-boostPayment')
var botCreation = require('./test-30-botCreation')
var latestTest = require('./test-40-latestTest')
var paidMeet = require('./test-41-paidMeet')
var sphinxPeople = require('./test-42-sphinxPeople')
var clearAllContacts = require('./test-98-clearAllContacts')
var clearAllChats = require('./test-99-clearAllChats')
var cleanup = require('./test-00-cleanup')

module.exports = {
    checkSelf, 
    queryRoutes,
    contactTest, 
    imageTest, 
    joinTribe, 
    tribeImages, 
    paidImages,
    paidMsgs,
    chatPayment,
    chatInvoice,
    tribe3Msgs,
    tribe3Imgs,
    tribe3Escrow,
    tribe3Private,
    tribe3Profile,
    tribeEdit,
    streamPayment,
    boostPayment,
    botCreation,
    latestTest,
    paidMeet,
    sphinxPeople,
    clearAllContacts,
    clearAllChats, 
    cleanup
}