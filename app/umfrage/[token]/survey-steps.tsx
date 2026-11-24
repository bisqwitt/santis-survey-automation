'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

export default function SurveySteps({ children, submitAction }: {
  children: ReactNode;
  submitAction: (data: FormData) => Promise<boolean>;
}) {
  const sections = Children.toArray(children);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'editing' | 'sending' | 'saved'>('editing');
  const [error, setError] = useState('');
  const progress = useRef<HTMLParagraphElement>(null);
  const previous = useRef(step);
  useEffect(() => {
    if (previous.current !== step) progress.current?.focus();
    previous.current = step;
  }, [step]);

  const last = step === sections.length - 1;
  if (status === 'saved') return <div role="status"><h2>Vielen Dank!</h2><p>Deine Antworten wurden gespeichert.</p></div>;
  function valid(form: HTMLFormElement) {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-current-step] input, [data-current-step] textarea'
    );
    for (const field of fields) {
      if (field instanceof HTMLTextAreaElement) {
        field.setCustomValidity(field.value.trim() ? '' : 'Bitte gib eine Antwort ein.');
      }
      if (!field.reportValidity()) {
        return false;
      }
    }
    return true;
  }
  return <form noValidate onSubmit={async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (status === 'sending' || !valid(form)) return;
    if (!last) return setStep(step + 1);
    const data = new FormData(form);
    setError('');
    setStatus('sending');
    try {
      if (await submitAction(data)) return setStatus('saved');
      setError('Bitte prüfe, ob du alle Fragen vollständig beantwortet hast.');
    } catch {
      setError('Die Abgabe konnte nicht bestätigt werden. Bitte versuche es erneut.');
    }
    setStatus('editing');
  }}>
    <p ref={progress} tabIndex={-1}>Abschnitt {step + 1} von {sections.length}</p>
    {sections.map((section, index) => <div key={index} hidden={index !== step}
      data-current-step={index === step ? true : undefined}>{section}</div>)}
    {error && <p role="alert">{error}</p>}
    <div className="bar">
      {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Zurück</button>}
      {last
        ? <button type="submit" disabled={status === 'sending'} style={{ marginInlineStart: 'auto' }}>{status === 'sending' ? 'Wird gesendet …' : 'Antworten absenden'}</button>
        : <button type="button" style={{ marginInlineStart: 'auto' }} onClick={event => {
            const form = event.currentTarget.form;
            if (form && valid(form)) setStep(step + 1);
          }}>Weiter</button>}
    </div>
  </form>;
}
