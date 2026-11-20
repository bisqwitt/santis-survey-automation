import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { categories } from './questions';

export function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return salt + ':' + scryptSync(password, salt, 64).toString('hex');
}

let connection;
export function db() {
  if (connection) return connection;
  mkdirSync('data', { recursive: true });
  const database = new DatabaseSync('data/survey.sqlite');
  database.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
  try {
    database.exec(`CREATE TABLE IF NOT EXISTS participants (
      token TEXT PRIMARY KEY, first TEXT NOT NULL, last TEXT NOT NULL,
      email TEXT NOT NULL, answers TEXT
    ); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS catalogs (id INTEGER PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS administrator (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL, hash TEXT NOT NULL);`);
    if (!database.prepare('SELECT id FROM catalogs LIMIT 1').get()) {
      database.prepare('INSERT INTO catalogs VALUES(1,?)').run(JSON.stringify(categories));
    }
    if (!database.prepare('PRAGMA table_info(participants)').all().some(column => column.name === 'catalog')) {
      database.exec('ALTER TABLE participants ADD COLUMN catalog INTEGER NOT NULL DEFAULT 1');
      const legacy = ['Wie zufrieden bist du mit deinen Aufgaben?', 'Wie zufrieden bist du mit der Unterstützung durch deine Führungskraft?', 'Wie zufrieden bist du mit der Zusammenarbeit im Team?'];
      const questions = ['tasks','support','team'].map((id,i)=>({id,label:legacy[i],options:['1','2','3','4','5']}));
      database.prepare('INSERT INTO catalogs VALUES(0,?)').run(JSON.stringify([{title:'Frühere Mitarbeiterumfrage',questions}]));
      database.exec("UPDATE participants SET catalog=0 WHERE json_type(answers,'$.tasks') IS NOT NULL");
    }
    if (!database.prepare('SELECT id FROM administrator').get()) {
      if (!process.env.ADMIN_INITIAL_PASSWORD) throw Error('ADMIN_INITIAL_PASSWORD für die Ersteinrichtung setzen.');
      database.prepare('INSERT INTO administrator VALUES(1,?,?)').run('sascha-max.steinegger@santismail.ch', passwordHash(process.env.ADMIN_INITIAL_PASSWORD));
      database.exec('DELETE FROM sessions');
    }
    database.exec('COMMIT');
    connection = database;
    return connection;
  } catch (error) {
    database.exec('ROLLBACK');
    database.close();
    throw error;
  }
}