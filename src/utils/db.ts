import Dexie, { Table } from 'dexie'
import { Event } from 'nostr-tools'

export type DbEvent = Event

export class Db extends Dexie {
  events!: Table<DbEvent, string>

  constructor() {
    super('db')
    this.version(1).stores({
      events: '&id, [kind+pubkey], created_at',
    })
  }
}

export const db = new Db()
