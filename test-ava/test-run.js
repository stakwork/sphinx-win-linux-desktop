var test = require('ava');
var f = require('./functions')
var i = require('./test-index')

test('check node exists, is own first contact', async t => {
    const nodeArray = [0, 1]
    await f.runTest(t, i.checkSelf, nodeArray)
})

test('add contact, send message, delete contact', async t => {
    const nodeArray = [0, 1]
    await f.runTest(t, i.contactTest, nodeArray)
})

test('add contact, send message, send image, delete contacts', async t => {
    const nodeArray = [0, 1]
    await f.runTest(t, i.imageTest, nodeArray)
 })

test('create tribe, join tribe, send messages, leave tribe, delete tribe', async t => {
    const nodeArray = [0, 1]
    await f.runTest(t, i.joinTribe, nodeArray)
})

test('create tribe, join tribe, send images, leave tribe, delete tribe', async t => {
    const nodeArray = [0, 1]
    await f.runTest(t, i.tribeImages, nodeArray)
})


