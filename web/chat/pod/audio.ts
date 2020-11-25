import { Howl, Howler } from 'howler';

let playlist: Audio[] = [] // list of episodes
let index = 0

interface Audio {
  item: Item,
  sound: Howl,
}
interface Item {
  id: number,
  url: string,
  title: string,
  artist: string,
  artwork: string
}

function getCurrent() {
  let a
  playlist.forEach(h=>{
    if(h.sound.playing()) a = h
  })
  if(a) return a
  return playlist[index] || null
}

export async function getCurrentTrack() {
  const a = getCurrent()
  if (!a) return
  if (!a.item) return
  return a.item.id
}

export async function playing() {
  let playing = false
  playlist.forEach(h=>{
    if(h.sound.playing()) playing=true
  })
  return playing
}

export async function add(item: Item) {
  return new Promise((resolve, reject) => {
    var sound: Howl = new Howl({
      src: [item.url],
      html5: true,
      buffer: true,
    })
    playlist.unshift({ item, sound })
    sound.on('load', function (e) {
      resolve(true)
    })
    sound.on('loaderror', function (e) {
      resolve(false)
    })
  })
}

export async function stopAll() {
  Howler.stop()
}

export async function reset() {
  Howler.stop()
  playlist = []
  index = 0
}

export async function play(id) {
  if(id) {
    const ok = playlist.find(a=>a.item.id===id)
    if(ok && ok.sound) {
      ok.sound.play()
      return
    }
  }
  const a = getCurrent()
  if (!a) return
  if (!a.sound) return
  return a.sound.play()
}

export async function pause() {
  const a = getCurrent()
  if (!a) return
  if (!a.sound) return
  return a.sound.pause()
}

export async function getDuration() {
  const a = getCurrent()
  if (!a) return 0
  if (!a.sound) return 0
  return a.sound.duration()
}

export async function getPosition() {
  const a = getCurrent()
  if (!a) return
  if (!a.sound) return
  return a.sound.seek()
}

export async function seekTo(s: number) {
  const a = getCurrent()
  if (!a) return
  if (!a.sound) return
  return a.sound.seek(s)
}

export async function getState() {
  return null
}