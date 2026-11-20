'use client';

import { useId, useRef } from 'react';
import { deleteParticipant } from '../actions';

export default function DeleteButton({token, name}: {token: string; name: string}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  return <>
    <button className="delete-trigger action-icon" type="button" onClick={() => dialog.current?.showModal()} title="Teilnehmer löschen" aria-label={name+' löschen'}>
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg>
    </button>
    <dialog className="delete-dialog" ref={dialog} aria-labelledby={title}>
      <h2 id={title}>Teilnehmer samt Umfrage und Antworten endgültig löschen?</h2>
      <p>{name}</p>
      <form action={deleteParticipant.bind(null, token)}>
        <button autoFocus type="button" className="secondary" onClick={() => dialog.current?.close()}>Abbrechen</button>
        <button className="delete-submit" name="confirm" value="yes">Endgültig löschen</button>
      </form>
    </dialog>
  </>;
}
