import { db } from './db';
import type { categories } from './questions';

export type Catalog = typeof categories;

export function getCatalog(id: number): Catalog {
  const row = db().prepare('SELECT body FROM catalogs WHERE id=?').get(id);
  if (!row) throw Error('Katalogversion fehlt.');
  return JSON.parse(String(row.body));
}

export function currentVersion(): number {
  return Number(db().prepare('SELECT max(id) AS id FROM catalogs').get()?.id);
}