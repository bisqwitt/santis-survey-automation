type Question = { id: string; label: string; options?: string[] };
export const textLimit = 250;
const quality = ["Sehr gut", "Gut", "Mittelmässig", "Weniger gut", "Gar nicht gut"];
const frequency = ["Immer", "Meistens", "Teilweise", "Selten", "Nie"];

export const categories: { title: string; questions: Question[] }[] = [
  { title: "Allgemeiner Eindruck", questions: [
    { id: "pw1", label: "Wie haben dir die beiden Projektwochen insgesamt gefallen?", options: quality },
    { id: "pw2", label: "Wie beurteilst du die Organisation der Projektwochen?", options: quality },
    { id: "pw3", label: "Waren die Aufgaben und Aufträge verständlich erklärt?", options: frequency },
  ] },
  { title: "Praxisbezug und Lernerfahrung", questions: [
    { id: "pw4", label: "Konntest du einen realistischen Einblick in den Berufsalltag gewinnen?", options: ["Ja, sehr gut","Ja, teilweise","Eher wenig","Nein"] },
    { id: "pw5", label: "Waren die Aufgaben abwechslungsreich?", options: ["Ja, sehr","Grösstenteils","Teilweise","Eher nicht"] },
    { id: "pw6", label: "Hast du etwas Neues gelernt oder deine Fähigkeiten erweitert?", options: ["Ja, sehr viel","Ja, einiges","Wenig","Nein"] },
    { id: "pw7", label: "Welche Fähigkeiten oder Erkenntnisse konntest du verbessern oder neu erwerben?" },
  ] },
  { title: "Zusammenarbeit und Betreuung", questions: [
    { id: "pw8", label: "Wie hast du die Betreuung durch Corinne und Natascha erlebt?", options: quality },
    { id: "pw9", label: "Hast du bei Fragen ausreichend Unterstützung erhalten?", options: frequency },
    { id: "pw10", label: "Wie hat dir die Zusammenarbeit mit deinen Mitschülerinnen und Mitschülern gefallen?", options: quality },
  ] },
  { title: "Ablauf und Gestaltung", questions: [
    { id: "pw11", label: "War die Zeit für die einzelnen Aufgaben angemessen?", options: ["Genau richtig","Teilweise zu knapp","Teilweise zu grosszügig","Insgesamt zu knapp","Insgesamt zu grosszügig"] },
    { id: "pw12", label: "Waren die Wechsel zwischen den Abteilungen und Aufgaben sinnvoll organisiert?", options: ["Ja","Teilweise","Nein","Kann ich nicht beurteilen"] },
    { id: "pw13", label: "Welche Aufgaben oder Aktivitäten haben dir besonders gut gefallen? Warum?" },
    { id: "pw14", label: "Was hat dir gefehlt oder was hättest du dir anders gewünscht?" },
  ] },
  { title: "Persönliches Fazit", questions: [
    { id: "pw15", label: "Was war deine wichtigste Erkenntnis aus den beiden Projektwochen?" },
    { id: "pw16", label: "Was hat dich besonders überrascht oder beeindruckt?" },
    { id: "pw17", label: "Was würdest du bei zukünftigen Projektwochen ändern oder verbessern?" },
    { id: "pw18", label: "Gibt es sonst noch etwas, das du uns mitteilen möchtest?" },
  ] },
];

export function readAnswers(form: FormData, catalog: typeof categories) {
  const answers: Record<string, string> = {};
  for (const category of catalog) {
    for (const question of category.questions) {
      const raw = form.get(question.id);
      if (raw !== null && typeof raw !== "string") return null;
      const value = (raw ?? "").replace(/\r\n/g, "\n");
      if (question.options ? !question.options.includes(value) : !value.trim() || value.length > textLimit) return null;
      answers[question.id] = value.trim();
    }
  }
  return answers;
}
