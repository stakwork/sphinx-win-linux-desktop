import moment from 'moment'
import { detailsStore } from '../src/store/details'
import * as ipc from './crypto/ipc'

const HOURS = 12

export async function wasCheckedRecently(): Promise<boolean> {
  const now = moment().unix()
  const enteredAtStr = localStorage.getItem('version_checked')
  const enteredAt = enteredAtStr ? parseInt(enteredAtStr) : 0
  if (!enteredAt) {
    return false
  }
  if (now < enteredAt + (60 * 60 * HOURS)) { // 12 hours
    return true
  }
  return false
}

// return IF to show dialog
export async function check(): Promise<boolean> {
  const was = await wasCheckedRecently()
  if (was) {
    return false
  }

  const vs = await detailsStore.getVersions()
  if (!vs) {
    return
  }

  const platforms = {
    win32:'windows',
    linux:'linux',
    darwin:'linux' // for testing on mac!
  }
  
  const {version,platform} = await getThisVersionAndPlatform()
  const thePlatform = platforms[platform] || 'linux'

  localStorage.setItem('version_checked', ts())
  const currentVersion = parseInt(vs[thePlatform])
  if (currentVersion !== version) {
    return true
  }
  return false
}

function ts() {
  return moment().unix() + ''
}

interface VersionAndPlatform {
  version: number
  platform: string
}
async function getThisVersionAndPlatform():Promise<VersionAndPlatform>{
  try {
    const v:any = await ipc.send('version-and-platform', {})
    return v
  } catch(e) {
    return {
      version:1,
      platform:'win32'
    }
  }
}