var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('check node exists, is own first contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.checkSelf, nodeArray, false) //always iterate: false
})

test('check query routes between nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.queryRoutes, nodeArray, false) //always iterate: false
})

test('add contact, send messages, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.contactTest, nodeArray, r.iterate)
})

test('add contact, send images, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.imageTest, nodeArray, r.iterate)
})

test('create tribe, join tribe, send messages, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.joinTribe, nodeArray, r.iterate)
})

test('create tribe, join tribe, send images, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribeImages, nodeArray, r.iterate)
})

test('create tribe, join tribe, send paid messages, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.paidImages, nodeArray, r.iterate)
})

test('add contact, send payments, delete contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.chatPayment, nodeArray, r.iterate)
})

test('add contact, send invoices, pay invoices, delete contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.chatInvoice, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send messages, 2 nodes leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Msgs, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send images, 2 nodes leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Imgs, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send messages, check escrow, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Escrow, nodeArray, r.iterate)
})

test('create private tribe, nodes ask to join, reject and accept, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Private, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, change alias and profile pic, check change, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Profile, nodeArray, r.iterate)
})

test('establish chat, node1 streams payment, node1 streams split payment, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.streamPayment, nodeArray, r.iterate)
})

test('create tribe, join tribe, send messages, boost messages, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.boostPayment, nodeArray, r.iterate)
})

test('create tribe, create bot, add bot to tribe, delete bot, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.botCreation, nodeArray, false)
})

test.beforeEach('clear all contacts from nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.clearAllContacts, nodeArray, false) //always iterate: false
})

test.beforeEach('clear all chats from nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.clearAllChats, nodeArray, false) //always iterate: false
})