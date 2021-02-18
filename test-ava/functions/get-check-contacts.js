var http = require('ava-http');
var h = require('../helpers/helper-functions')
var getContacts = require('./get-contacts')

function getCheckContacts(t, node1, node2){
    return new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(async() => {

        i++
        const [node1contact, node2contact] = await getContacts(t, node1, node2)
        if(node1contact.contact_key && node2contact.contact_key) {
          clearInterval(interval)
          resolve([node1contact, node2contact])
        }
        else if(i>10){
          clearInterval(interval)
          reject([])
        } 
      }, 3000)
    })
  }

  module.exports = getCheckContacts