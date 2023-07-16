import Dexie, { Table } from 'dexie'
import { Event } from 'nostr-tools'

export type DbEvent = Event

export class Db extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  events!: Table<DbEvent, string>

  constructor() {
    super('db')
    this.version(1).stores({
      events: '&id, [kind+pubkey], created_at',
    })
  }
}

export const db = new Db()
