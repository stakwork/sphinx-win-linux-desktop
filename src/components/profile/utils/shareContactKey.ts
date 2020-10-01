export default async function shareContactKey(contacts, setSharing){
  const me = contacts.contacts.find(c=> c.id===1)
  const contact_key = me.contact_key
  if(!contact_key) return
  setSharing(true)
  await contacts.updateContact(1, {contact_key})
  setSharing(false)
}