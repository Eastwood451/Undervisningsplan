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
// Frikvarterer (09.45-10.05, 11.35-12.05, 12.50-13.00, 13.45-13.55) vises som en gennemgående gul bjælke.
const BREAK_ROWS = new Set([2, 5, 7, 9]);

const FIXED: Record<string, Entry> = {
  "0-3": { text: "5. kl. matematik", kind: "fixed" },
  "1-3": { text: "5. kl. matematik", kind: "fixed" },
  "1-4": { text: "5. kl. matematik", kind: "fixed" },
  "3-0": { text: "5. kl. matematik", kind: "fixed" },
  "3-1": { text: "5. kl. matematik", kind: "fixed" },
};

const DUTIES: Record<string, Entry> = {
  "0-2": { text: "VAGT 09.45-09.55\nmed Sabine", kind: "duty" },
  "1-2": { text: "VAGT 09.55-10.05\nmed Martin", kind: "duty" },
  "3-5": { text: "VAGT 11.45-11.55\nmed Marie", kind: "duty" },
  "4-5": { text: "VAGT 11.55-12.05\nmed Julie", kind: "duty" },
};

// SPS 2026-2027: faste SPS-blokke. De vises altid, også når der ligger en anden aktivitet i samme felt.
const SPS: Record<string, Entry> = {
  "0-0": { text: "SPS 6 mat", kind: "support" },
  "0-1": { text: "SPS", kind: "support" },
  "0-4": { text: "SPS 8 mat", kind: "support" },
  "0-6": { text: "SPS 9 nf", kind: "support" },
  "1-0": { text: "SPS 8 da", kind: "support" },
  "1-6": { text: "SPS 9 mat", kind: "support" },
  "1-8": { text: "SPS 9 mat", kind: "support" },
  "3-3": { text: "SPS 6 mat", kind: "support" },
  "3-6": { text: "SPS 8 mat", kind: "support" },
  "3-8": { text: "SPS 8 mat", kind: "support" },
  "4-3": { text: "SPS 8 mat", kind: "support" },
  "4-4": { text: "SPS 9 mat", kind: "support" },
  "4-6": { text: "SPS 9 mat", kind: "support" },
  "4-8": { text: "SPS 7 da", kind: "support" },
};

const WEEKS: Array<{ week: number; dates: string[]; changes: Record<string, Entry> }> = [
  {
    week: 35,
    dates: ["24/8", "25/8", "26/8", "27/8", "28/8"],
    changes: {
      "1-0": { text: "6. kl. dansk", kind: "weekly" },
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
      "3-6": { text: "1. kl. musik", kind: "weekly" },
    },
  },
  { week: 37, dates: ["7/9", "8/9", "9/9", "10/9", "11/9"], changes: {} },
  {
    week: 38,
    dates: ["14/9", "15/9", "16/9", "17/9", "18/9"],
    changes: { "1-6": { text: "6. kl. dansk", kind: "weekly" } },
  },
];

// Fast undervisning/vagt går forud for ugelisten; en SPS-blok i samme felt vises sammen med den.
function entriesFor(day: number, row: number, changes: Record<string, Entry>): Entry[] {
  const key = `${day}-${row}`;
  const main = FIXED[key] ?? DUTIES[key] ?? changes[key];
  return [main, SPS[key]].filter((entry): entry is Entry => Boolean(entry));
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
            const entries = entriesFor(column, row, changes);
            const className = entries.length > 1 ? "schedule-overlap" : entries[0] ? `schedule-${entries[0].kind}` : "";
            return <td key={day} className={className}>{entries.map((entry, entryIndex) => <div className={`schedule-entry schedule-entry-${entry.kind}`} key={entryIndex}>{entry.text.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}</div>)}</td>;
          })}
        </tr>)}</tbody>
      </table>

      <div className="schedule-legend">
        <span><i className="schedule-fixed" />Fast undervisning</span>
        <span><i className="schedule-support" />Fast støttetime</span>
        <span><i className="schedule-weekly" />Ændring fra ugelisten</span>
        <span><i className="schedule-break-swatch" />Frikvarter</span>
        <span><i className="schedule-duty" />Gård-/gangvagt</span>
      </div>
      <footer>
        <span>Prioritet ved overlap: 5. klasse og vagter &gt; ugelisten &gt; faste støttetimer.</span>
        <span>Torsdag: Jacob + Laura dækker ved sygdom.</span>
        <small>Side {pageIndex + 1} af {WEEKS.length}</small>
      </footer>
    </section>)}
  </main>;
}
