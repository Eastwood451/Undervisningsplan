type EntryKind = "fixed" | "support" | "weekly" | "duty";
type Entry = { text: string; kind: EntryKind };

const DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
const TIMES = [
  "08.15-09.00",
  "09.00-09.45",
  "09.45-10.05",
  "10.05-10.50",
  "10.50-11.35",
  "11.35-12.05",
  "12.05-12.50",
  "12.50-13.00",
  "13.00-13.45",
  "13.45-13.55",
  "13.55-14.40",
];
const BREAK_ROWS = new Set([2, 5, 7, 9]);

const FIXED: Record<string, Entry> = {
  "0-1": { text: "7. kl. matematik", kind: "fixed" },
  "0-3": { text: "5. kl. matematik", kind: "fixed" },
  "1-1": { text: "7. kl. matematik", kind: "fixed" },
  "1-3": { text: "5. kl. matematik", kind: "fixed" },
  "1-4": { text: "5. kl. matematik", kind: "fixed" },
  "3-0": { text: "5. kl. matematik", kind: "fixed" },
  "3-1": { text: "5. kl. matematik", kind: "fixed" },
  "3-4": { text: "7. kl. matematik", kind: "fixed" },
  "4-0": { text: "7. kl. matematik", kind: "fixed" },
  "4-1": { text: "7. kl. matematik", kind: "fixed" },
};

const DUTIES: Record<string, Entry> = {
  "0-2": { text: "VAGT 09.45-09.55\nmed Sabine", kind: "duty" },
  "1-2": { text: "VAGT 09.55-10.05\nmed Martin", kind: "duty" },
  "3-5": { text: "VAGT 11.45-11.55\nmed Marie", kind: "duty" },
  "4-5": { text: "VAGT 11.55-12.05\nmed Julie", kind: "duty" },
};

const SUPPORT: Record<string, Entry> = {
  "0-0": { text: "STØTTE\n6. kl. matematik", kind: "support" },
  "0-4": { text: "STØTTE\n8. kl. matematik", kind: "support" },
  "0-6": { text: "STØTTE\n9. kl. naturfag", kind: "support" },
  "1-0": { text: "STØTTE\n8. kl. dansk", kind: "support" },
  "1-6": { text: "STØTTE\n9. kl. matematik", kind: "support" },
  "1-8": { text: "STØTTE\n9. kl. matematik", kind: "support" },
  "3-3": { text: "STØTTE\n6. kl. matematik", kind: "support" },
  "3-6": { text: "STØTTE\n8. kl. matematik", kind: "support" },
  "3-8": { text: "STØTTE\n8. kl. matematik", kind: "support" },
  "4-3": { text: "STØTTE\n8. kl. matematik", kind: "support" },
  "4-4": { text: "STØTTE\n9. kl. matematik", kind: "support" },
  "4-6": { text: "STØTTE\n9. kl. matematik", kind: "support" },
  "4-8": { text: "STØTTE\n7. kl. dansk", kind: "support" },
};

const WEEKS: Array<{ week: number; dates: string[]; changes: Record<string, Entry> }> = [
  {
    week: 35,
    dates: ["24/8", "25/8", "26/8", "27/8", "28/8"],
    changes: {
      "1-0": { text: "6. kl. dansk", kind: "weekly" },
      "3-3": { text: "Støtte, 7. kl.", kind: "weekly" },
      "4-3": { text: "8. kl. matematik", kind: "weekly" },
      "4-4": { text: "9. kl. matematik", kind: "weekly" },
      "4-6": { text: "9. kl. matematik", kind: "weekly" },
      "4-8": { text: "9. kl. VF", kind: "weekly" },
    },
  },
  {
    week: 36,
    dates: ["31/8", "1/9", "2/9", "3/9", "4/9"],
    changes: {
      "0-4": { text: "6. kl. dansk", kind: "weekly" },
      "0-6": { text: "2. kl. musik", kind: "weekly" },
      "1-0": { text: "2. kl. dansk", kind: "weekly" },
      "2-0": { text: "6. kl. dansk", kind: "weekly" },
      "2-1": { text: "2. kl. dansk", kind: "weekly" },
      "2-3": { text: "2. kl. dansk", kind: "weekly" },
      "2-6": { text: "6. kl. dansk", kind: "weekly" },
      "2-8": { text: "6. kl. dansk", kind: "weekly" },
      "2-10": { text: "9. kl. tysk", kind: "weekly" },
      "3-3": { text: "7. kl. tysk", kind: "weekly" },
      "3-6": { text: "1. kl. musik", kind: "weekly" },
      "4-3": { text: "7. kl. tysk", kind: "weekly" },
    },
  },
  { week: 37, dates: ["7/9", "8/9", "9/9", "10/9", "11/9"], changes: {} },
  {
    week: 38,
    dates: ["14/9", "15/9", "16/9", "17/9", "18/9"],
    changes: { "1-6": { text: "6. kl. dansk", kind: "weekly" } },
  },
];

function entryFor(day: number, row: number, changes: Record<string, Entry>) {
  const key = `${day}-${row}`;
  return FIXED[key] ?? DUTIES[key] ?? changes[key] ?? SUPPORT[key];
}

export default function WeeklySchedulePrint() {
  return <main className="schedule-print-view">
    <nav className="schedule-print-actions" aria-label="Ugeskema">
      <a href="./">← Tilbage til kalenderen</a>
      <button type="button" onClick={() => window.print()}>Print ugeskema</button>
    </nav>

    {WEEKS.map(({ week, dates, changes }, pageIndex) => <section className="schedule-sheet" key={week}>
      <header className="schedule-heading">
        <h1>JACOBS SKEMA - UGE {week}</h1>
        <span>Skoleåret 2026/27</span>
      </header>

      <table className="schedule-table">
        <thead><tr><th>TID</th>{DAYS.map((day, index) => <th key={day}>{day}<small>{dates[index]}</small></th>)}</tr></thead>
        <tbody>{TIMES.map((time, row) => <tr className={BREAK_ROWS.has(row) ? "schedule-break" : ""} key={time}>
          <th>{time}</th>
          {DAYS.map((day, column) => {
            const entry = entryFor(column, row, changes);
            return <td key={day} className={entry?.kind ?? ""}>{entry?.text.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}</td>;
          })}
        </tr>)}</tbody>
      </table>

      <div className="schedule-legend">
        <span><i className="fixed" />Fast undervisning</span>
        <span><i className="support" />Fast støttetime</span>
        <span><i className="weekly" />Ændring fra ugelisten</span>
        <span><i className="duty" />Gård-/gangvagt</span>
      </div>
      <footer>
        <span>Prioritet ved overlap: 5./7. klasse og vagter &gt; ugelisten &gt; faste støttetimer.</span>
        <span>Torsdag: Jacob + Laura dækker ved sygdom.</span>
        <small>Side {pageIndex + 1} af {WEEKS.length}</small>
      </footer>
    </section>)}
  </main>;
}
