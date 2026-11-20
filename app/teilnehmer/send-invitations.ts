'use server';

import { spawn } from 'node:child_process';
import path from 'node:path';
import { requireAdmin } from '../actions';
import { db } from '../db';
import { mailConfig } from '../mail-config';

export async function sendInvitations(tokens: string[]) {
  await requireAdmin();
  const config = mailConfig();
  if (!config) return { sent: [], message: 'Der E-Mail-Versand ist noch nicht eingerichtet.' };
  if (!Array.isArray(tokens) || !tokens.every(token => typeof token === 'string')) throw Error('Ungültige Auswahl.');
  const recipients = db().prepare(`SELECT token, first, email FROM participants
    WHERE answers IS NULL AND token IN (SELECT value FROM json_each(?))`).all(JSON.stringify(tokens)) as {token:string;first:string;email:string}[];
  if (!recipients.length) return {sent: [], message: 'Keine offenen Umfragen in der Auswahl.'};
  const messages = recipients.map(person => ({
    token: String(person.token), email: String(person.email),
    body: `Hallo ${person.first}\n\nWie hast du die Projektwochen erlebt? Über deinen persönlichen Link kannst du uns eine Rückmeldung geben:\n\n${config.origin}/umfrage/${encodeURIComponent(String(person.token))}\n\nVielen Dank für dein Feedback!\nSANTIS Training AG`
  }));
  const sent = await new Promise<string[]>(resolve => {
    const child = spawn(process.env.SMTP_PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
      ['-I', path.join(process.cwd(), 'scripts', 'send_invitations.py')], {windowsHide:true, stdio:['pipe','pipe','ignore']});
    let output = '';
    child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk; });
    child.on('error', () => resolve([]));
    child.on('close', () => resolve(output.trim().split(/\s+/).filter(token=>tokens.includes(token))));
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify({config, messages}));
  });
  const remaining = new Set(tokens).size - sent.length;
  return {sent, message: `${sent.length} von ${new Set(tokens).size} Einladungen vom Mailserver bestätigt.${remaining ? ' Bitte prüfe die übrigen Empfänger und die SMTP-Einstellungen.' : ''}`};
}
