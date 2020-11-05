
import { feedStore } from './feed'
import { chatStore } from './chats'

export default async function actions(action: string) {
  if (!action) return
  console.log("ACTION", action)

  if (action.startsWith('create_podcast')) {
    const arr = action.split(':')
    if (arr.length < 2) return
    const id = arr[1]
    const r = await feedStore.loadFeedById(id)
    if (!(r && r.title)) return
    await chatStore.createTribe({
      name: r.title,
      img: r.image,
      description: r.description,
      feed_url: r.url,
      app_url: '',
      tags: ['Podcast'],
      price_per_message: 0,
      price_to_join: 0,
      escrow_amount: 0,
      escrow_time: 0,
      unlisted: false,
      is_private: false,
    })
  }

  if (action.startsWith('join_tribe')) {
    const arr = action.split(':')
    if (arr.length < 2) return
    const uuid = arr[1]
    const host = arr.length === 3 ? arr[2] : 'tribes.sphinx.chat'
    const r = await chatStore.getTribeDetails(host, uuid)
    await chatStore.joinTribe({
      name: r.title,
      uuid,
      group_key: r.group_key,
      img: r.image,
      host,
      amount: r.price_to_join,
      owner_alias: r.owner_alias,
      owner_pubkey: r.owner_pubkey,
      is_private: false,
    })
  }
}