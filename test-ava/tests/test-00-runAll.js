var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('./index')
var r = require('../run-ava')

/*
npx ava test-00-runAll.js --verbose --serial --timeout=2m
*/

test('check node exists, is own first contact (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.checkSelf, nodeArray, false) //always iterate: false
})

test('check query routes between nodes (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.queryRoutes, nodeArray, false) //always iterate: false
})

test('add contact, send messages, delete contacts (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.contactTest, nodeArray, r.iterate)
})

test('add contact, send images, delete contacts (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.imageTest, nodeArray, r.iterate)
})

test('create tribe, join tribe, send messages, leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.joinTribe, nodeArray, r.iterate)
})

test('create tribe, join tribe, send images, leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribeImages, nodeArray, r.iterate)
})

test('create tribe, join tribe, send paid messages, leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.paidImages, nodeArray, r.iterate)
})

test('add contact, send payments, delete contact (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.chatPayment, nodeArray, r.iterate)
})

test('add contact, send invoices, pay invoices, delete contact (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.chatInvoice, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send messages, 2 nodes leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Msgs, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send images, 2 nodes leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Imgs, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, send messages, check escrow, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Escrow, nodeArray, r.iterate)
})

test('create private tribe, nodes ask to join, reject and accept, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Private, nodeArray, r.iterate)
})

test('create tribe, two nodes join tribe, change alias and profile pic, check change, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Profile, nodeArray, r.iterate)
})

test('create tribe, edit tribe, check edits, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribeEdit, nodeArray, r.iterate)
})

test('establish chat, node1 streams payment, node1 streams split payment, delete contacts (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.streamPayment, nodeArray, r.iterate)
})

test('create tribe, join tribe, send messages, boost messages, leave tribe, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.boostPayment, nodeArray, r.iterate)
})

test('create tribe, create bot, add bot to tribe, delete bot, delete tribe (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.botCreation, nodeArray, false)
})

test('create timestamp, add contact and chat, get latest, delete contacts (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.latestTest, nodeArray, false)
})

test('update price_to_meet, add contact paid/unpaid, reset contact (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.paidMeet, nodeArray, false)
})

test('Sphinx People testing (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.sphinxPeople, nodeArray, false)
})

test.beforeEach('clear all contacts from nodes (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.clearAllContacts, nodeArray, false) //always iterate: false
})

test.beforeEach('clear all chats from nodes (run-all)', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.clearAllChats, nodeArray, false) //always iterate: false
})