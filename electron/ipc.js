const {ipcMain} = require('electron')
const RNCryptor = require('jscryptor')
const rsa = require('./rsa')

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

ipcMain.on('decrypt-rsa', (event, args) => {
    try {
        if(!args.rid) return
        // args.private is string
        // args.data is base64 encoded
        const dec = rsa.decrypt(args.private, args.data)
        event.reply(args.rid, dec)
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