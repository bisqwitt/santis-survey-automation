'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from './actions';

const links = [['/antworten','Umfrageauswertung'], ['/teilnehmer','Teilnehmende'], ['/fragekatalog','Fragekatalog']];
export default function AdminNav() {
  const active = usePathname();
  if (active !== '/passwort' && !links.some(([href]) => href === active)) return <span>Projektwochen</span>;
  return <div className="admin-tools"><nav aria-label="Verwaltung">{links.map(([href,label])=>
    <Link key={href} href={href} aria-current={active===href?'page':undefined}>{label}</Link>
  )}</nav><div className="account">
    <button type="button" className="account-trigger secondary" aria-label="Kontomenü" title="Kontomenü" popoverTarget="account-options">
      <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="8" r="3.5"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>
      </svg>
    </button>
    <div popover="auto" id="account-options" className="account-options">
      <Link href="/passwort" onClick={event=>event.currentTarget.parentElement?.hidePopover()}>Passwort ändern</Link>
      <form action={logout}><button>Abmelden</button></form>
    </div>
  </div></div>;
}
