import { get } from '@vercel/edge-config'

export async function getEdgeConfig(key: string) {
  return await get(key)
}

