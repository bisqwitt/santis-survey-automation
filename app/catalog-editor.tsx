'use client';
import { useEffect, useRef, useState } from 'react';
import CatalogIconButton from './catalog-icon-button';
import { editCatalog } from './actions';
import type { Catalog } from './catalog';

type Question = Catalog[number]['questions'][number];
function QuestionForm({catalog,category,question,version,close}:{
  catalog:Catalog;category:string;question?:Question;version:number;close:()=>void
}) {
  const [group,setGroup]=useState(category);
  const [choice,setChoice]=useState(!question || !!question.options);
  const [rows,setRows]=useState((question?.options ?? ['','']).map((text,id)=>({text,id})));
  const nextId=useRef(rows.length);
  return <form className="question-form" action={editCatalog.bind(null,version,question?'save':'add',question?.id ?? '')}>
    <label>Kategorie<select name={group?'category':undefined} value={group} onChange={e=>setGroup(e.target.value)}>
      {catalog.map(c=><option key={c.title}>{c.title}</option>)}<option value="">Neue Kategorie erstellen …</option></select></label>
    {!group && <label>Name der neuen Kategorie<input name="category" required/></label>}
    <label>Fragetext<input required name="label" defaultValue={question?.label}/></label>
    <fieldset><legend>Antworttyp</legend><div className="scale">{[['choice','Auswahl'],['text','Freitext']].map(([value,label])=>
      <label key={value}><input type="radio" name="type" value={value} checked={choice===(value==='choice')} onChange={()=>setChoice(value==='choice')}/>{label}</label>)}</div></fieldset>
    {choice && <fieldset><legend>Antwortoptionen</legend>
      {rows.map((row,i)=><div className="option-row" key={row.id}><label>Option {i+1}<input required name="option" value={row.text}
        onChange={e=>setRows(rows.map(r=>r.id===row.id?{...r,text:e.target.value}:r))}/></label>
        {rows.length>2 && <CatalogIconButton icon="remove" label={'Option '+(i+1)+' entfernen'} onClick={()=>setRows(rows.filter(r=>r.id!==row.id))}/>}</div>)}
      <button className="secondary" type="button" onClick={()=>setRows([...rows,{id:nextId.current++,text:''}])}>+ Antwortoption</button></fieldset>}
    <button>{question?'Änderungen speichern':'Frage hinzufügen'}</button> <button type="button" className="secondary" onClick={close}>Abbrechen</button>
  </form>;
}

type EditorDialog = { kind: 'new' | 'rename' } | { kind: 'edit' | 'hide'; question: Question };

export default function CatalogEditor({catalog,version,initialCategory}:{catalog:Catalog;version:number;initialCategory?:string}) {
  const [selected,setSelected]=useState(initialCategory ?? catalog[0].title);
  const [active,setActive]=useState<EditorDialog|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const group=catalog.find(c=>c.title===selected) ?? catalog[0];

  useEffect(()=>{
    if (active && !dialog.current?.open) dialog.current?.showModal();
  },[active]);

  function close() { dialog.current?.close(); }
  return <section className="catalog-editor"><div className="bar"><h2>Fragen für neue Einladungen</h2>
    <button onClick={()=>setActive({kind:'new'})}>+ Neue Frage</button></div>
    <p>Änderungen gelten für Teilnehmende, die du nach dem Speichern erfasst. Bereits erstellte Links führen weiterhin zum ursprünglichen Fragebogen.</p>
    <div className="catalog-browser">
    <div className="catalog-sidebar" role="group" aria-label="Kategorien">
      <strong>Kategorien</strong>
      {catalog.map(c=><button type="button" key={c.title} aria-pressed={c===group}
        onClick={()=>setSelected(c.title)}>{c.title}</button>)}
    </div>
    <label className="catalog-picker">Kategorie
      <select value={group.title} onChange={event=>setSelected(event.target.value)}>
        {catalog.map(c=><option key={c.title}>{c.title}</option>)}
      </select>
    </label>
    <div className="catalog-questions">
    <div className="bar category-heading"><h3>{group.title}</h3>
      <div className="edit-controls">
      <form className="edit-controls" action={editCatalog.bind(null,version,'move',group.title)}>
        <button className="secondary action-icon" name="direction" value="up" disabled={group===catalog[0]} aria-label="Kategorie nach oben verschieben" title="Kategorie nach oben verschieben">↑</button>
        <button className="secondary action-icon" name="direction" value="down" disabled={group===catalog[catalog.length-1]} aria-label="Kategorie nach unten verschieben" title="Kategorie nach unten verschieben">↓</button>
      </form>
      <CatalogIconButton icon="edit" label={'Kategorie umbenennen: '+group.title} onClick={()=>setActive({kind:'rename'})}/>
      </div>
    </div>
    {group.questions.map(q=><div className="question-item bar" key={q.id}><span>{q.label}</span>
      <div className="edit-controls">
        <CatalogIconButton icon="edit" label={'Frage bearbeiten: '+q.label} onClick={()=>setActive({kind:'edit',question:q})}/>
        <CatalogIconButton icon="remove" label={'Frage ausblenden: '+q.label} onClick={()=>setActive({kind:'hide',question:q})}/>
      </div></div>)}
    </div></div>
    <dialog ref={dialog} className="delete-dialog catalog-dialog" aria-labelledby="catalog-dialog-title"
      onClose={()=>setActive(null)} onSubmit={close}>
      {active && <><h2 id="catalog-dialog-title">{{new:'Neue Frage',edit:'Frage bearbeiten',rename:'Kategorie umbenennen',hide:'Frage ausblenden?'}[active.kind]}</h2>
        {(active.kind==='new' || active.kind==='edit') && <QuestionForm catalog={catalog} category={group.title}
          question={active.kind==='edit'?active.question:undefined} version={version} close={close}/>}
        {active.kind==='rename' && <form action={editCatalog.bind(null,version,'rename',group.title)}>
          <label>Kategoriename<input required name="category" defaultValue={group.title}/></label>
          <div className="edit-controls"><button type="button" className="secondary" onClick={close}>Abbrechen</button><button>Speichern</button></div>
        </form>}
        {active.kind==='hide' && <form action={editCatalog.bind(null,version,'hide',active.question.id)}>
          <strong>{active.question.label}</strong>
          <p>Diese Frage wird in neuen Einladungen ausgeblendet. Bereits erstellte Fragebögen behalten die Frage.</p>
          <div className="edit-controls"><button autoFocus type="button" className="secondary" onClick={close}>Abbrechen</button>
            <button className="delete-submit">Frage ausblenden</button></div>
        </form>}
      </>}
    </dialog>
  </section>;
}
