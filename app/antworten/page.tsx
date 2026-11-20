import { requireAdmin } from '../actions';
import { db } from '../db';


import { currentVersion, getCatalog } from '../catalog';
import Results, { type Distribution } from '../results';
type Person = {first:string;last:string;email:string;token:string;answers:string|null;catalog:number};
export default async function Answers() {
  await requireAdmin();

  const people=db().prepare('SELECT * FROM participants ORDER BY rowid DESC').all() as Person[];
  const completed=people.filter(p=>p.answers);
  const latest=currentVersion();
  const versions=[...new Set([latest,...completed.map(p=>p.catalog)])].sort((a,b)=>b-a);
  const catalogs=new Map(versions.map(id=>[id,getCatalog(id)]));
  const rows=new Map(completed.map(p=>[p.token,JSON.parse(p.answers!) as Record<string,string|number>]));
  const seen=new Set<string>();
  const grouped=new Map<string,Distribution[]>();
  for (const [version,catalog] of catalogs) {
    for (const category of catalog) {
      for (const question of category.questions) {
        if (!question.options || seen.has(question.id)) continue;
        seen.add(question.id);
        const values=[...rows.values()].map(row=>row[question.id]).filter(value=>value!=null).map(String);
        if (!values.length) continue;
        const title=category.title;
        const questions=grouped.get(title) ?? [];
        questions.push({label:question.label, historical:version!==latest, options:question.options.map(label=>({label,count:values.filter(value=>value===label).length}))});
        grouped.set(title,questions);
      }
    }
  }
  const groups=[...grouped].map(([title,questions])=>({title,questions}));
  return <><h1>Umfrageauswertung</h1>
    <section><Results groups={groups} completed={completed.length} total={people.length}/></section>
    <section><h2>Einzelne Antworten</h2>{!completed.length && <p>Noch keine ausgefüllten Fragebögen.</p>}
      {completed.map(p=><details className="result-disclosure" key={p.token}><summary>{p.first} {p.last} · {p.email}</summary>
        {catalogs.get(p.catalog)!.map(c=><div key={c.title}><h3>{c.title}</h3><dl>
          {c.questions.map(q=><div key={q.id}><dt>{q.label}</dt><dd className="comment">{rows.get(p.token)?.[q.id] || 'Keine Antwort'}</dd></div>)}
        </dl></div>)}</details>)}</section>
  </>;
}
