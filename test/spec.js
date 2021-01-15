// const Application = require('spectron').Application
// const assert = require('assert')
// const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
// const path = require('path')
// const utils = require('./utils')

// describe('Application launch', function () {
//   this.timeout(10000)

//   beforeEach(function () {
//     this.app = new Application({
//       // Your electron path can be any binary
//       // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
//       // But for the sake of the example we fetch it from our node_modules.
//       path: electronPath,

//       // Assuming you have the following directory structure

//       //  |__ my project
//       //     |__ ...
//       //     |__ main.js
//       //     |__ package.json
//       //     |__ index.html
//       //     |__ ...
//       //     |__ test
//       //        |__ spec.js  <- You are here! ~ Well you should be.

//       // The following line tells spectron to look and use the main.js file
//       // and the package.json located 1 level above.
//       args: [path.join(__dirname, '..')]
//     })
//     return this.app.start()

//   })

//   afterEach(function () {
//     if (this.app && this.app.isRunning()) {
//       return this.app.stop()
//     }
//   })

//   describe("open window", function() {

//     it('shows an initial window', function () {
//       return this.app.client.getWindowCount().then(function (count) {
//         console.log("count = ", count)
//         assert.equal(count, 1)
//         // Please note that getWindowCount() will return 2 if `dev tools` are opened.
//         // assert.equal(count, 2)
//       })
//     })
  
//     // it('should have the correct title', async function () {
//     //   const title = await this.app.client.getTitle();
//     //   console.log("title = ", title)
//     //   assert.equal(title, "Sphinx Chat")
  
//     // })

//       // it('See Message Text', async function () {
//       //   await this.app.client.waitUntilWindowLoaded()
//       //   await sleep(2000)
//       //   const msgTxt = await this.app.client.$("div.onboardtext")
//       //   await sleep(2000)
//       //   console.log("CL MsgTxt = ", msgTxt)

//       //   assert.equal(msgTxt, "Paste the invitation text or scan the QR code")
    
//       // })

//       it('Try Login', async function () {
//         await this.app.client.waitUntilWindowLoaded()
//         // const tagName = await this.app.client.$$("div")
//         // console.log("tagName = ", tagName)
//         // const text = tagName[2].getText()
//         // console.log("TEXT = ", text)
//         await sleep(2000)
//         // const ourElement = await utils.findByClassName(this.app, "sc-fznyAO dzEKJj")
        
//         // console.log("Our Element = ", ourElement)

//         const tagName = await this.app.client.react$("Msg")
//         console.log("tagName = ", tagName)



//         await sleep(2000)
//         const txtUserName = await this.app.client.$("input")
//         txtUserName.setValue("SETTING VALUE")
//         await sleep(2000)
//         const sendButton = await this.app.client.$("svg")
//         sendButton.click()
//         await sleep(2000)
//         console.log("txtUserName", txtUserName)

//   })


//   })



//   // it('has the code input', function () {
//   //   return this.app.client.setValue("#onboard-enter-code", "teststring") 
//   //   .element("#onboard-send-button")

//   // })

// })

// async function sleep(ms) {
// 	return new Promise(resolve => setTimeout(resolve, ms))
// }