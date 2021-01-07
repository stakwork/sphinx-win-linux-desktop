import moment from 'moment'
import AsyncStorage from '@react-native-community/async-storage'
import version from '../version'
import {detailsStore} from '../store/details'

const HOURS = 12 // 0.001

export async function wasCheckedRecently(): Promise<boolean> {
  const now = moment().unix()
  const enteredAtStr = await AsyncStorage.getItem('version_checked')
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
  if(was) return false

  const vs = await detailsStore.getVersions()
  const av = vs && vs.android
  if(!av) return
  AsyncStorage.setItem('version_checked', ts())
  const currentVersion = parseInt(av)
  if(currentVersion!==version) {
    return true
  }
  return false 
}

function ts() {
  return moment().unix() + ''
}

