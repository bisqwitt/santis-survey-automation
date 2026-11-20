import { requireAdmin } from '../actions';

import CatalogEditor from '../catalog-editor';
import { currentVersion, getCatalog } from '../catalog';
export default async function Questions({searchParams}:PageProps<'/fragekatalog'>) {
  await requireAdmin();
  const {fehler,kategorie}=await searchParams;
  const version=currentVersion();
  return <><h1>Fragekatalog</h1>
    {fehler && <p role="alert">{fehler==='version'?'Der Katalog wurde inzwischen bearbeitet. Prüfe die aktuellen Fragen und speichere erneut.':'Prüfe Kategorie, Frage und Antwortoptionen. Auswahlfragen brauchen mindestens zwei unterschiedliche Optionen. Mindestens eine Frage muss im Katalog bleiben.'}</p>}
    <CatalogEditor key={version} version={version} catalog={getCatalog(version)} initialCategory={typeof kategorie==='string'?kategorie:undefined}/></>;
}
