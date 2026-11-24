'use client';
import { useEffect, useRef, useState } from 'react';

function copySelection(url: string, container: HTMLElement) {
  const previousFocus = document.activeElement;
  const field = document.createElement('textarea');
  field.value = url;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;left:-9999px;top:0';
  container.appendChild(field);
  try {
    field.focus({preventScroll:true});
    field.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (previousFocus instanceof HTMLElement) previousFocus.focus({preventScroll:true});
    field.remove();
  }
}

export default function LinkField({token}:{token:string}) {
  const [copied,setCopied]=useState(false);
  const [manualLink,setManualLink]=useState('');
  const container = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (manualLink) dialog.current?.showModal();
  }, [manualLink]);
  const generation = useRef(0);
  useEffect(() => {
    const row = container.current?.closest('.participant-row');
    if (!row) return;
    function reset() {
      generation.current++;
      setCopied(false);
    }
    function onFocusOut(event: Event) {
      const next = (event as FocusEvent).relatedTarget;
      if (!(next instanceof Node && row?.contains(next)) && !row?.matches(':hover')) reset();
    }
    row.addEventListener('pointerleave', reset);
    row.addEventListener('focusout', onFocusOut);
    return () => {
      row.removeEventListener('pointerleave', reset);
      row.removeEventListener('focusout', onFocusOut);
    };
  }, []);
  async function copy() {
    const attempt = ++generation.current;
    const url=new URL('/umfrage/'+token,window.location.origin).href;
    let success = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch {
        // Try copying a selection if clipboard access was denied.
      }
    }
    if (attempt !== generation.current) return;
    if (!success && container.current) success = copySelection(url, container.current);
    setCopied(success);
    setManualLink(success ? '' : url);
  }
  return <div className="copy-invitation" ref={container}>
    <button className="secondary" type="button" onClick={copy} aria-live="polite">{copied?'Link kopiert':'Link kopieren'}</button>
    {manualLink && <dialog ref={dialog} className="manual-copy-dialog" aria-label="Umfragelink kopieren"
      onClose={() => setManualLink('')}>
      <h2>Umfragelink kopieren</h2>
      <p>Der Link ist markiert. Kopiere ihn mit der Kopierfunktion deines Geräts.</p>
      <input aria-label="Persönlicher Umfragelink" autoFocus readOnly value={manualLink}
        onFocus={event => event.currentTarget.select()}/>
      <div><button type="button" onClick={() => dialog.current?.close()}>Schliessen</button></div>
    </dialog>}
  </div>;
}
