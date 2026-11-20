'use client';

import { useId, useRef, type ReactNode } from 'react';
import { saveParticipant } from '../actions';

export default function ParticipantDialog({token = null, children}: {token?: string | null; children: ReactNode}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const title = useId();
  function open() {
    form.current?.reset();
    dialog.current?.showModal();
  }
  return <>
    {token ? <button className="secondary action-icon" type="button" onClick={open} title="Teilnehmer bearbeiten" aria-label="Teilnehmer bearbeiten">
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15z"/></svg>
    </button> : <button type="button" onClick={open}>Teilnehmer erfassen</button>}
    <dialog className="delete-dialog edit-dialog" ref={dialog} aria-labelledby={title}>
      <h2 id={title}>{token ? 'Teilnehmer bearbeiten' : 'Teilnehmer erfassen'}</h2>
      <form ref={form} action={saveParticipant.bind(null, token)} onSubmit={() => dialog.current?.close()}>
        {children}
        <div className="edit-controls">
          <button type="button" className="secondary" onClick={() => dialog.current?.close()}>Abbrechen</button>
          <button>{token ? 'Speichern' : 'Link erstellen'}</button>
        </div>
      </form>
    </dialog>
  </>;
}
