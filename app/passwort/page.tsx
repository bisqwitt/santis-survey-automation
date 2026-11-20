import { changePassword, requireAdmin } from '../actions';

export default async function PasswordPage({searchParams}:PageProps<'/passwort'>) {
  await requireAdmin();
  const {fehler}=await searchParams;
  return <section className="password-panel"><h1>Passwort ändern</h1><form action={changePassword}>{fehler==='passwort' && <p role="alert">Bitte prüfe das bisherige Passwort und die Bestätigung.</p>}
      <label>Bisheriges Passwort<input type="password" required name="old" autoComplete="current-password"/></label>
      <label>Neues Passwort<input type="password" required name="new" autoComplete="new-password"/></label>
      <label>Neues Passwort wiederholen<input type="password" required name="confirm" autoComplete="new-password"/></label>
      <button>Speichern und erneut anmelden</button></form></section>;
}
