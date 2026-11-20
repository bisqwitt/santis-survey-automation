import { authenticated, login } from './actions';
import { redirect } from 'next/navigation';
export default async function Home({searchParams}:PageProps<'/'>) {
  const {fehler}=await searchParams;
  if (!await authenticated()) return <section className="login"><h1>Admin-Login</h1><form action={login}>
    <label>E-Mail<input name="email" type="email" required autoComplete="username"/></label>
    <label>Passwort<input required type="password" name="password" autoComplete="current-password"/></label>
    {fehler && <p role="alert">Anmeldung fehlgeschlagen.</p>}<button>Anmelden</button></form></section>;
  redirect('/antworten');
}
