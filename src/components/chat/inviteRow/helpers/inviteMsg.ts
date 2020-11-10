export default function inviteMsg(statusString: string, name: string, confirmed?: boolean) {
  switch (statusString) {
    case 'pending':
      return `${name} is on the waitlist`
    case 'payment_pending':
      return confirmed ? 'Awaiting confirmation...' : 'Tap to pay and activate the invite'
    case 'ready':
      return 'Ready! Tap to share. Expires in 24 hours'
    case 'delivered':
      return 'Ready! Tap to share. Expires in 24 hours'
    case 'in_progress':
      return `${name} is signing on`
    case 'expired':
      return 'Expired'
    default:
      return 'Signup complete'
  }
}