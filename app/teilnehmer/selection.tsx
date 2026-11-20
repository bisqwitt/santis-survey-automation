'use client';
import { useState } from 'react';
import { deleteSelected } from '../actions';

export default function Selection({people,children}:{people:{token:string;name:string}[];children:React.ReactNode[]}) {
  const [selected,setSelected]=useState<string[]>([]);
  const [selecting,setSelecting]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const active=people.filter(p=>selected.includes(p.token));
  function update(tokens:string[]) {setSelected(tokens);setConfirm(false);}
  function finish() { update([]); setSelecting(false); }
  return <div className={selecting?'selection-active':'selection-idle'}><div className="bulk-tools">
    {selecting && <label><input type="checkbox" checked={active.length===people.length && people.length>0}
      onChange={e=>update(e.target.checked?people.map(p=>p.token):[])}/>Alle auswählen</label>}
    <button type="button" className="selection-toggle" onClick={()=>selecting ? finish() : setSelecting(true)}>
      {selecting?'Auswahl abbrechen':'Teilnehmende auswählen'}
    </button>
    {selecting && <button className="selection-delete" disabled={!active.length} onClick={()=>setConfirm(true)}>Auswahl löschen ({active.length})</button>}</div>
    {confirm && active.length>0 && <form className="delete-confirm" action={async form=>{finish(); await deleteSelected(form);}}>
      <strong>{active.length} ausgewählte Teilnehmende samt Umfragen und Antworten endgültig löschen?</strong>
      <p>{active.map(p=>p.name).join(', ')}</p>{active.map(p=><input key={p.token} type="hidden" name="token" value={p.token}/>)}
      <button name="confirm" value="yes">Endgültig löschen</button> <button className="secondary" type="button" onClick={()=>setConfirm(false)}>Abbrechen</button></form>}
    <div className="list-head" aria-hidden="true"><span>Name</span><span>E-Mail</span><span>Umfragestatus</span></div>
    {people.map((p,i)=><div className="participant-row" key={p.token}>{selecting && <input type="checkbox" aria-label={p.name+' auswählen'} checked={selected.includes(p.token)}
      onChange={e=>update(e.target.checked?[...selected,p.token]:selected.filter(t=>t!==p.token))}/>}{children[i]}</div>)}</div>;
}
