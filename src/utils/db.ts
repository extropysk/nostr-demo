import Dexie, { Table } from 'dexie'
import { Event, Filter } from 'nostr-tools'

type Tag = `#${string}`

export class Db extends Dexie {
  events!: Table<Event, string>

  constructor() {
    super('db')
    this.version(1).stores({
      events: '&id, [kind+pubkey], created_at',
    })
  }
}

export const filterEvents = (event: Event, filter: Filter) => {
  let predicate = true

  if (filter.ids) {
    predicate &&= filter.ids.includes(event.id)
  }

  if (filter.authors) {
    predicate &&= filter.authors.includes(event.pubkey)
  }

  if (filter.kinds) {
    predicate &&= filter.kinds.includes(event.kind)
  }

  if (filter.since) {
    predicate &&= event.created_at > filter.since
  }

  if (filter.until) {
    predicate &&= event.created_at < filter.until
  }

  Object.keys(filter)
    .filter((key) => key.startsWith('#'))
    .forEach((tag: string) => {
      predicate &&= event.tags.some(
        (t) => t[0] === tag.substring(1) && filter[tag as Tag]?.includes(t[1])
      )
    })

  return predicate
}

export const db = new Db()
