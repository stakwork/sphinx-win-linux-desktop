export default  function openImgViewer(obj, chat, ui, pricePerMessage){
  let contact_id=null
  if(!chat.id){ // if no chat (new contact)
    contact_id=chat.contact_ids.find(cid=>cid!==1)
  }
  ui.setImgViewerParams({
    contact_id,
    chat_id: chat.id||null,
    ...obj,
    pricePerMessage,
  })
}