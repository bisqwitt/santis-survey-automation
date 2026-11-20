'use client';

import { useRef, useState, useTransition } from 'react';
import { sendInvitations } from './send-invitations';

type Recipient = { token:string; first:string; last:string; email:string };

export default function InvitationDialog({people, ready}:{people:Recipient[];ready:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [selected,setSelected]=useState<string[]>([]);
  const [message,setMessage]=useState('');
  const [pending,start]=useTransition();
  function open() {
    setSelected([]);
    setMessage('');
    dialog.current?.showModal();
  }
  function send() {
    start(async()=>{
      try {
        const result=await sendInvitations(selected);
        setMessage(result.message);
        setSelected(selected.filter(token=>!result.sent.includes(token)));
      } catch {
        setMessage('Keine Versandbestätigung erhalten. Prüfe den Versand vor einem erneuten Versuch.');
      }
    });
  }
  return <><button type="button" className="secondary" onClick={open}>Einladungen versenden</button>
    <dialog ref={dialog} className="delete-dialog invitation-dialog" aria-labelledby="invitation-title" onCancel={event=>{if(pending) event.preventDefault();}}>
      <h2 id="invitation-title">Einladungen versenden</h2>
      {people.length ? <><p>Wähle die Teilnehmenden mit offener Umfrage. Jede Person erhält ihren eigenen Link per E-Mail.</p>
        <fieldset disabled={pending}><legend>Empfänger</legend>
          <label><input type="checkbox" checked={selected.length===people.length} onChange={e=>setSelected(e.target.checked?people.map(p=>p.token):[])}/>Alle auswählen</label>
          <div className="invitation-list">{people.map(p=><label key={p.token}><input type="checkbox" checked={selected.includes(p.token)}
            onChange={e=>setSelected(e.target.checked?[...selected,p.token]:selected.filter(token=>token!==p.token))}/>
            <span>{p.first} {p.last}<small>{p.email}</small></span></label>)}</div>
        </fieldset></> : <p>Es gibt keine offenen Umfragen.</p>}
      {!ready && <p>Der E-Mail-Versand ist noch nicht eingerichtet.</p>}
      <p role="status">{pending?'Einladungen werden versendet …':message}</p>
      <div className="edit-controls"><button className="secondary" type="button" disabled={pending} onClick={()=>dialog.current?.close()}>Schliessen</button>
        <button type="button" disabled={!ready || pending || !selected.length} onClick={send}>Versenden ({selected.length})</button></div>
    </dialog></>;
}

