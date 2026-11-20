'use client';
import { useEffect, useRef, useState } from 'react';

export default function LinkField({token}:{token:string}) {
  const [copied,setCopied]=useState(false);
  const [manualLink,setManualLink]=useState('');
  const container = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    const row = container.current?.closest('.participant-row');
    if (!row) return;
    function reset() {
      generation.current++;
      setCopied(false);
      setManualLink('');
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
    try {
      await navigator.clipboard.writeText(url);
      if (attempt !== generation.current) return;
      setCopied(true);
      setManualLink('');
    } catch {
      if (attempt !== generation.current) return;
      setCopied(false);
      setManualLink(url);
    }
  }
  return <div className="copy-invitation" ref={container}>
    <button className="secondary" type="button" onClick={copy} aria-live="polite">{copied?'Link kopiert':'Link kopieren'}</button>
    {manualLink && <label>Link zum Kopieren<input readOnly value={manualLink} onFocus={e=>e.target.select()}/></label>}
  </div>;
}
