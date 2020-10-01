export default async function tookPic(img, setDialogOpen, setTakingPhoto, viewer) {
  setDialogOpen(false)
  setTimeout(()=>{
    setTakingPhoto(false)
    if(img&&img.uri){
      viewer.openImgViewer({uri: img.uri}, viewer.chat, viewer.ui, viewer.pricePerMessage)
    }
  },250)
}