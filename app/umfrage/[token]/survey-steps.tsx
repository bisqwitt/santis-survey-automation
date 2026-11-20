'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

export default function SurveySteps({ children, submitAction }: {
  children: ReactNode;
  submitAction: (data: FormData) => Promise<void>;
}) {
  const sections = Children.toArray(children);
  const [step, setStep] = useState(0);
  const progress = useRef<HTMLParagraphElement>(null);
  const previous = useRef(step);
  useEffect(() => {
    if (previous.current !== step) progress.current?.focus();
    previous.current = step;
  }, [step]);

  const last = step === sections.length - 1;
  return <form action={submitAction} noValidate onSubmit={event => {
    const fields = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-current-step] input, [data-current-step] textarea'
    );
    for (const field of fields) {
      if (field instanceof HTMLTextAreaElement) {
        field.setCustomValidity(field.value.trim() ? '' : 'Bitte gib eine Antwort ein.');
      }
      if (!field.reportValidity()) {
        event.preventDefault();
        return;
      }
    }
    if (!last) {
      event.preventDefault();
      setStep(step + 1);
    }
  }}>
    <p ref={progress} tabIndex={-1}>Abschnitt {step + 1} von {sections.length}</p>
    {sections.map((section, index) => <div key={index} hidden={index !== step}
      data-current-step={index === step ? true : undefined}>{section}</div>)}
    <div className="bar">
      {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Zurück</button>}
      <button type="submit" style={{ marginInlineStart: 'auto' }}>{last ? 'Antworten absenden' : 'Weiter'}</button>
    </div>
  </form>;
}
