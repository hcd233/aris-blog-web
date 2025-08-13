import { pinyin } from 'pinyin-pro'

function randomLetters(length = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function generateSlugFromTitle(title: string): string {
  const pin = pinyin(title || '', { toneType: 'none', type: 'array' })
  const lettersOnly = pin.join('').toLowerCase().replace(/[^a-z]/g, '')
  const base = lettersOnly || 'post'
  return `${base}${randomLetters(4)}`
}