import EventEmitter from 'eventemitter3'

var EE = new EventEmitter()

export const CLIP_PAYMENT = 'clip-payment'
export const EXTRA_TEXT_CONTENT = 'extra-text-content'
export const REPLY_UUID = 'reply-uuid'
export const CANCEL_REPLY_UUID = 'cancel-reply-uuid'
export const CLEAR_REPLY_UUID = 'clear-reply-uuid'
export const LEFT_GROUP = 'left-group'
export const LEFT_IMAGE_VIEWER = 'left-image-viewer'
export const SHOW_REFRESHER = 'show-refresher'
export const RESET_IP = 'reset-ip'
export const RESET_IP_FINISHED = 'reset-ip-finished'


export default EE