import { requireAdmin } from '../actions';
import { db } from '../db';

import DeleteButton from './delete-button';
import ParticipantDialog from './participant-dialog';
import InvitationDialog from './invitation-dialog';
import { mailConfig } from '../mail-config';
import Selection from './selection';
import LinkField from '../link-field';
type Person = {first:string;last:string;email:string;token:string;answered:number};
function PersonFields({person}:{person?:Person}) {
  return <><label>Vorname<input name="first" required maxLength={100} defaultValue={person?.first}/></label>
    <label>Name<input name="last" required maxLength={100} defaultValue={person?.last}/></label>
    <label>E-Mail<input type="email" name="email" required maxLength={254} defaultValue={person?.email}/></label></>;
}

export default async function Participants({searchParams}:PageProps<'/teilnehmer'>) {
  await requireAdmin();
  const {fehler}=await searchParams;
  const people=db().prepare('SELECT token,first,last,email,answers IS NOT NULL AS answered FROM participants ORDER BY rowid DESC').all() as Person[];
  const completed = people.filter(person => person.answered).length;
  const recipients = people
    .filter(person => !person.answered)
    .map(({ token, first, last, email }) => ({ token, first, last, email }));
  return <><div className="bar"><h1>Teilnehmerverwaltung</h1><div className="edit-controls"><InvitationDialog people={recipients} ready={!!mailConfig()}/><ParticipantDialog><PersonFields/></ParticipantDialog></div></div>
    {fehler && <p role="alert">Bitte prüfe die Teilnehmerangaben.</p>}
    <section className="participant-list"><h2>Teilnehmerliste</h2>{people.length > 0 && <p className="list-counts">{people.length} insgesamt · {people.length - completed} offen · {completed} abgeschlossen</p>}{!people.length && <p>Noch keine Teilnehmenden erfasst.</p>}
      {people.length>0 && <Selection people={people.map(p=>({token:p.token,name:p.first+' '+p.last}))}>{people.map(p=><div key={p.token} className="person-card">
        <div className="person-heading">
          <strong className="person-name">{p.first} {p.last}</strong><span className="person-email">{p.email}</span>
          <div className="person-actions">
            <span className={p.answered ? 'person-status is-complete' : 'person-status'}>{p.answered ? 'Abgeschlossen' : 'Offen'}</span>
            {!p.answered && <LinkField token={p.token}/>}
          </div>
        <div className="person-edit edit-controls">
        <ParticipantDialog token={p.token}><PersonFields person={p}/></ParticipantDialog>
        <DeleteButton token={p.token} name={p.first+' '+p.last}/>
      </div></div></div>)}</Selection>}</section>
</>;
}
