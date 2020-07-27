const {ipcMain} = require('electron')
const RNCryptor = require('jscryptor')
const rsa = require('./rsa')
const keytar = require('./keytar')
const fetch = require('node-fetch')

ipcMain.on('etch', async (event, args) => {
    try {
        if(!args.rid) return
        const url = args.url.replace('https://cors-anywhere.herokuapp.com/','')
        const response = await fetch(url, args.config)
        const mimeType = response.headers.get('content-type')
        const data = await response.text()
        event.reply(args.rid, {data,mimeType})
    } catch(e) {
        console.log(e)
    }
})

ipcMain.on('decrypt', (event, args) => {
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.reply(args.rid, dec.toString('ascii'))
    } catch(e) {
        console.log(e)
    }
})

ipcMain.on('decrypt-64', (event, args) => {
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.reply(args.rid, dec.toString('base64'))
    } catch(e) {
        console.log('ERROR! decrypt-64')
    }
})

ipcMain.on('decrypt-rsa', async (event, args) => {
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        const private = await keytar.getPrivateKey()
        const dec = rsa.decrypt(private, args.data)
        event.reply(args.rid, dec)
    } catch(e) {
        console.log(e)
    }
})

ipcMain.on('set-private-key', (event, args) => {
    try {
        if(!args.rid) return
        // args.key
        keytar.setPrivateKey(args.key)
        event.reply(args.rid, true)
    } catch(e) {
        console.log(e)
    }
})

ipcMain.on('encrypt-rsa', (event, args) => {
    try {
        if(!args.rid) return
        // args.pubkey is string
        // args.data is base64 encoded
        const dec = rsa.encrypt(args.pubkey, args.data)
        event.reply(args.rid, dec)
    } catch(e) {
        console.log(e)
    }
})

ipcMain.on('decryptSync', (event, arg) => {
    try {
        const args = JSON.parse(arg)
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.returnValue = dec.toString('ascii')
    } catch(e) {
        console.log(e)
        event.returnValue = ''
    }
})