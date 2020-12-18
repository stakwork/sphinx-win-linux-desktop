const {ipcMain, ipcRenderer} = require('electron')
const RNCryptor = require('jscryptor')
const rsa = require('./rsa')
const keytar = require('./keytar')
const fetch = require('node-fetch')
const Crypto = require('crypto')
const meme = require('./meme')
const open = require('open');
const log = require('electron-log');

ipcMain.on('etch', async (event, args) => {
    console.log('=> etch')
    try {
        if(!args.rid) return
        const url = args.url.replace('https://cors-anywhere.herokuapp.com/','')
        const response = await fetch(url, args.config)
        const mimeType = response.headers.get('content-type')
        const data = await response.text()
        event.reply(args.rid, {data,mimeType})
    } catch(e) {
        log.error('etch ERROR', e)
    }
})

ipcMain.on('link', async (event, args) => {
    console.log('=> link')
    try {
        if(!args.rid) return
        await open(args.link||'');
        event.reply(args.rid, {success:true})
    } catch(e) {
        log.error('link ERROR', e)
    }
})

ipcMain.on('encrypt-symmetric', (event, args) => {
    console.log("=> encrypt-symmetric")
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        // args.password is string
        const buf = Buffer.from(args.data, 'ascii');
        const enc = RNCryptor.Encrypt(buf, args.password)
        event.reply(args.rid, enc)
    } catch(e) {
        log.error('encrypt-symmetric ERROR', e)
    }
})

ipcMain.on('decrypt', (event, args) => {
    console.log('=> decrypt')
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.reply(args.rid, dec.toString('ascii'))
    } catch(e) {
        log.error('decrypt ERROR', e)
    }
})

ipcMain.on('decrypt-64', (event, args) => {
    console.log('=> decrypt-64')
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.reply(args.rid, dec.toString('base64'))
    } catch(e) {
        log.error('decrypt-64 ERROR', e)
    }
})

ipcMain.on('decrypt-rsa', async (event, args) => {
    console.log('=> decrypt-rsa')
    try {
        if(!args.rid) return
        // args.data is base64 encoded
        const private = await keytar.getPrivateKey()
        const dec = rsa.decrypt(private, args.data)
        event.reply(args.rid, dec)
    } catch(e) {
        log.error('decrypt-rsa ERROR', e)
    }
})

ipcMain.on('set-private-key', (event, args) => {
    console.log('=> set-private-key')
    try {
        if(!args.rid) return
        // args.key
        keytar.setPrivateKey(args.key)
        event.reply(args.rid, true)
    } catch(e) {
        log.error('set-private-key ERROR', e)
    }
})

ipcMain.on('get-private-key', async (event, args) => {
    console.log('=> get-private-key')
    try {
        if(!args.rid) return
        const pk = await keytar.getPrivateKey()
        event.reply(args.rid, pk)
    } catch(e) {
        log.error('get-private-key ERROR', e)
    }
})

ipcMain.on('gen-keys', async (event, args) => {
    console.log('=> gen-keys')
    try {
        if(!args.rid) return // no other args
        const {public,private} = await rsa.genKeys()
        keytar.setPrivateKey(private)
        event.reply(args.rid, public)
    } catch(e) {
        log.error('gen-keys ERROR', e)
    }
})

ipcMain.on('encrypt-rsa', (event, args) => {
    console.log('=> encrypt-rsa')
    try {
        if(!args.rid) return
        // args.pubkey is string
        // args.data is base64 encoded
        const dec = rsa.encrypt(args.pubkey, args.data)
        event.reply(args.rid, dec)
    } catch(e) {
        log.error('encrypt-rsa ERROR', e)
    }
})

ipcMain.on('upload-file', async (event, args) => {
    console.log('=> upload-file')
    try {
        if(!args.rid) return
        // args.file is a string (base64)
        // args.type is string
        // args.host is string
        // args.token is string (the auth token for meme server)
        // args.filename is string
        const res = await meme.uploadMeme(args.file, args.type, args.host, args.token, args.filename, false)
        event.reply(args.rid, res)
    } catch(e) {
        log.error('upload-file ERROR', e)
    }
})

ipcMain.on('upload-public-file', async (event, args) => {
    console.log('=> upload-public-file')
    try {
        if(!args.rid) return
        const res = await meme.uploadMeme(args.file, args.type, args.host, args.token, args.filename, true)
        event.reply(args.rid, res)
    } catch(e) {
        log.error('upload-public-file ERROR', e)
    }
})

ipcMain.on('decryptSync', (event, arg) => {
    console.log('=> decryptSync')
    try {
        const args = JSON.parse(arg)
        // args.data is base64 encoded
        // args.password is string
        const dec = RNCryptor.Decrypt(args.data, args.password)
        event.returnValue = dec.toString('ascii')
    } catch(e) {
        log.error('decryptSync ERROR', e)
        event.returnValue = ''
    }
})

ipcMain.on('rand', (event, args) => {
    console.log('=> rand')
    try {
        if(!args.rid) return
        // args.length
        const size = args.length
        const r = Crypto.randomBytes(size).toString('base64').slice(0, size)
        event.reply(args.rid, r)
    } catch(e) {
        log.error('rand ERROR', e)
        event.returnValue = ''
    }
})
