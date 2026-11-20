import { notFound } from 'next/navigation';
import { submit } from '../../actions';
import { textLimit } from '../../questions';
import { getCatalog } from '../../catalog';
import { db } from '../../db';
import SurveySteps from './survey-steps';

export default async function Survey({params,searchParams}:PageProps<'/umfrage/[token]'>) {
  const {token}=await params;
  const person=db().prepare('SELECT first, answers, catalog FROM participants WHERE token=?').get(token);
  if (!person) notFound();
  if (person.answers) return <section><h1>Vielen Dank!</h1><p>Deine Antworten wurden gespeichert.</p></section>;
  const categories = getCatalog(Number(person.catalog));
  return <section>
    <h1>Feedback zu den Projektwochen</h1>
    <p>Hallo {String(person.first)}, bitte beantworte alle Fragen. Wähle pro Auswahlfrage eine Antwort.</p>
    {(await searchParams).fehler && <p role="alert">Bitte beantworte jede Frage.</p>}
    <SurveySteps submitAction={submit.bind(null, token)}>
      {categories.map(category => <div key={category.title}>
        <h2>{category.title}</h2>
        {category.questions.map(question => <fieldset key={question.id}>
          <legend id={question.id}>{categories.slice(0,categories.indexOf(category)).reduce((total,c)=>total+c.questions.length,0) + category.questions.indexOf(question) + 1}. {question.label}</legend>
          {question.options ? <div className="scale">{question.options.map(option =>
            <label key={option}><input type="radio" name={question.id} value={option} required/>{option}</label>
          )}</div> : <div className="survey-text">
            <textarea required aria-labelledby={question.id} aria-describedby={question.id+'-limit'} name={question.id} maxLength={textLimit} rows={3}/>
            <small id={question.id+'-limit'}>Max. {textLimit} Zeichen</small>
          </div>}
        </fieldset>)}
      </div>)}
    </SurveySteps>
  </section>;
}
