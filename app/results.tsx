'use client';
import { useState } from 'react';

export type Distribution = {label:string;historical:boolean;options:{label:string;count:number}[]};
type Group = {title:string;questions:Distribution[]};
const chartColors = ['#062744', '#26649a', '#7899bc', '#4489aa', '#afc9de', '#445c79'];
function color(index: number) { return chartColors[index % chartColors.length]; }

function Chart({question, pie}:{question:Distribution;pie:boolean}) {
  const total=question.options.reduce((n,o)=>n+o.count,0);
  const colors=question.options.map((o,i)=>{
    const start=question.options.slice(0,i).reduce((n,item)=>n+item.count,0)*100/(total || 1);
    const position=start+100*o.count/(total || 1);
    return color(i)+' '+start+'% '+position+'%';
  });
  return <div className="chart"><h4>{question.label}</h4>{question.historical && <small>Frühere Fragefassung · </small>}<small>{total} {total===1 ? "Antwort":"Antworten"}</small>
    {total>0 && (pie ? <div aria-hidden className="pie" style={{background:'conic-gradient('+colors.join(',')+')'}}/> :
      <div className="columns" aria-hidden>{question.options.map((o,i)=><div key={o.label} className="bar-column">
        <span style={{height:(100*o.count/total)+'%',background:color(i)}}/></div>)}</div>)}
    <ul>{question.options.map((o,i)=><li key={o.label}><i style={{background:color(i)}}/>{o.label} · <b>{o.count}</b></li>)}</ul>
  </div>;
}

export default function Results({groups,completed,total}:{groups:Group[];completed:number;total:number}) {
  const [pie,setPie]=useState(true);
  return <><div className="stats-heading">
    <div><h2>Statistik</h2><p>{completed} von {total} Teilnehmenden haben geantwortet.</p></div>
    {groups.length>0 && <div className="chart-switch" role="group" aria-label="Diagrammtyp">
      <button type="button" aria-label="Kreisdiagramm" aria-pressed={pie} onClick={()=>setPie(true)}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v8h8a8 8 0 1 1-8-8Z"/><path d="M13 2.5a7 7 0 0 1 4.5 4.5H13Z"/></svg>Kreis
      </button>
      <button type="button" aria-label="Säulendiagramm" aria-pressed={!pie} onClick={()=>setPie(false)}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 11h4v7H2zm6-8h4v15H8zm6 4h4v11h-4z"/></svg>Säulen
      </button>
    </div>}
    </div>
    {!groups.length && <p>Noch keine Auswahlantworten vorhanden.</p>}
    {groups.map(g=><details className="result-disclosure" key={g.title}><summary>{g.title}</summary>
      {g.questions.map((q,i)=><Chart key={i} question={q} pie={pie}/>)}</details>)}</>;
}
