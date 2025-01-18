import { kv } from '@vercel/kv'

if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('KV_URL and KV_REST_API_TOKEN must be defined')
}

const kvStore = kv.connect({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function getFromKV(key: string) {
  return await kvStore.get(key)
}

export async function setInKV(key: string, value: any) {
  await kvStore.set(key, value)
}

export async function deleteFromKV(key: string) {
  await kvStore.del(key)
}

