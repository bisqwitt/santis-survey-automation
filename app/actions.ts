'use server';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { getCatalog } from './catalog';
import { db, passwordHash } from './db';
import { readAnswers } from './questions';

function digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
function field(form: FormData, key: string) { return String(form.get(key) ?? '').trim(); }
function matches(password:string, stored:string) {
  return timingSafeEqual(Buffer.from(passwordHash(password,stored.split(':')[0])), Buffer.from(stored));
}

export async function authenticated() {
  await connection();
  const token = (await cookies()).get('admin_session')?.value;
  return !!token && !!db().prepare('SELECT 1 FROM sessions WHERE token=? AND expires>?').get(digest(token), Date.now());
}

export async function requireAdmin() { if (!await authenticated()) redirect('/'); }

export async function login(form: FormData) {
  const admin = db().prepare('SELECT email, hash FROM administrator').get()!;
  if (field(form,'email').toLowerCase() !== admin.email || !matches(String(form.get('password')),String(admin.hash))) redirect('/?fehler=login');
  const token = randomBytes(32).toString('hex');
  db().prepare('DELETE FROM sessions WHERE expires <= ?').run(Date.now());
  db().prepare('INSERT INTO sessions VALUES (?,?)').run(digest(token), Date.now()+28800000);
  (await cookies()).set('admin_session', token, {httpOnly:true, secure:false, sameSite:'lax', path:'/', maxAge:28800});
  redirect('/');
}

export async function changePassword(form:FormData) {
  await requireAdmin();
  const oldHash = String(db().prepare('SELECT hash FROM administrator').get()!.hash);
  const next = String(form.get('new') ?? '');
  if (!matches(String(form.get('old')),oldHash) || !next.trim() || next !== form.get('confirm')) redirect('/passwort?fehler=passwort');
  const database=db();
  database.exec('BEGIN IMMEDIATE');
  try {
    const result=database.prepare('UPDATE administrator SET hash=? WHERE hash=?').run(passwordHash(next),oldHash);
    if (result.changes) database.exec('DELETE FROM sessions');
    database.exec('COMMIT');
  } catch(error) { database.exec('ROLLBACK'); throw error; }
  (await cookies()).delete('admin_session');
  redirect('/');
}

export async function logout() {
  const jar = await cookies();
  db().prepare('DELETE FROM sessions WHERE token=?').run(digest(jar.get('admin_session')?.value ?? ''));
  jar.delete('admin_session');
  redirect('/');
}

export async function saveParticipant(token:string|null, form: FormData) {
  await requireAdmin();
  const [first,last,email] = ['first','last','email'].map(key => field(form,key));
  if (!first || !last || first.length>100 || last.length>100 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect('/teilnehmer?fehler=eingabe');
  if (token) db().prepare('UPDATE participants SET first=?,last=?,email=? WHERE token=?').run(first,last,email,token);
  else db().prepare('INSERT INTO participants(token,first,last,email,catalog) SELECT ?,?,?,?,max(id) FROM catalogs').run(randomUUID(),first,last,email);
  redirect('/teilnehmer');
}

export async function deleteParticipant(token:string,form:FormData) {
  await requireAdmin();
  if (form.get('confirm')==='yes') db().prepare('DELETE FROM participants WHERE token=?').run(token);
  redirect('/teilnehmer');
}

export async function deleteSelected(form:FormData) {
  await requireAdmin();
  const tokens=form.getAll('token').filter(value=>typeof value==='string');
  if (form.get('confirm')==='yes' && tokens.length) {
    db().prepare('DELETE FROM participants WHERE token IN (SELECT value FROM json_each(?))').run(JSON.stringify(tokens));
  }
  redirect('/teilnehmer');
}

export async function editCatalog(version:number, action:string, target:string, form:FormData) {
  await requireAdmin();
  const catalog=getCatalog(version);
  const category=field(form,'category');
  const source=catalog.find(c=>c.questions.some(q=>q.id===target));
  if (action==='move') {
    const index=catalog.findIndex(group=>group.title===target);
    const direction=field(form,'direction');
    const next=index+(direction==='up' ? -1 : 1);
    if (!['up','down'].includes(direction) || index<0 || next<0 || next>=catalog.length) redirect('/fragekatalog?fehler=katalog');
    [catalog[index],catalog[next]]=[catalog[next],catalog[index]];
  } else if (action==='rename') {
    const group=catalog.find(c=>c.title===target);
    if (!category || !group || catalog.some(c=>c!==group && c.title===category)) redirect('/fragekatalog?fehler=katalog');
    group.title=category;
  } else if (action==='hide') {
    if (!source) redirect('/fragekatalog?fehler=katalog');
    source.questions=source.questions.filter(q=>q.id!==target);
  } else {
    if (action!=='add' && !(action==='save' && source)) redirect('/fragekatalog?fehler=katalog');
    const label=field(form,'label');
    const type=field(form,'type');
    const options=type==='choice' ? form.getAll('option').map(value=>String(value).trim()) : undefined;
    if (!category || !label || !['text','choice'].includes(type) || (options && (options.length<2 || options.includes('') || new Set(options).size!==options.length))) redirect('/fragekatalog?fehler=katalog');
    const question={id:randomUUID(),label,options};
    const destination=catalog.find(c=>c.title===category);
    if (source && source===destination) source.questions=source.questions.map(q=>q.id===target ? question : q);
    else {
      if (source) source.questions=source.questions.filter(q=>q.id!==target);
      if (destination) destination.questions.push(question);
      else catalog.push({title:category,questions:[question]});
    }
  }
  const active=catalog.filter(c=>c.questions.length);
  if (!active.length) redirect('/fragekatalog?fehler=katalog');
  const result=db().prepare('INSERT INTO catalogs(body) SELECT ? WHERE (SELECT max(id) FROM catalogs)=?').run(JSON.stringify(active),version);
  if (!result.changes) redirect('/fragekatalog?fehler=version');
  if (action==='move') redirect('/fragekatalog?kategorie='+encodeURIComponent(target));
  redirect('/fragekatalog');
}

export async function submit(token: string, form: FormData) {
  const person=db().prepare('SELECT catalog, answers FROM participants WHERE token=?').get(token);
  if (!person) notFound();
  if (person.answers) return true;
  const answers = readAnswers(form,getCatalog(Number(person.catalog)));
  if (!answers) return false;
  db().prepare('UPDATE participants SET answers=? WHERE token=? AND answers IS NULL').run(JSON.stringify(answers),token);
  return true;
}
