import { nip05 } from 'nostr-tools'

export const isNip05verified = async (pubkey: string, fullname?: string) => {
  if (!fullname) {
    return false
  }

  const res = await nip05.queryProfile(fullname)
  return res?.pubkey === pubkey
}
