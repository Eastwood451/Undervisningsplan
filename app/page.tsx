"use client";

import { useMemo, useState } from "react";

type ClassName = "5. klasse" | "7. klasse";
type CalendarEvent = { date: string; minutes: number; title: string; detail: string; chapter: number; review: string; doNow: string; homework: string; due: string };

const MONTHS = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const HOLIDAYS = [
  ["2026-10-10", "2026-10-18", "Efterårsferie"],
  ["2026-12-19", "2027-01-03", "Juleferie"],
  ["2027-02-20", "2027-02-28", "Vinterferie"],
  ["2027-03-20", "2027-03-29", "Påskeferie"],
  ["2027-05-06", "2027-05-09", "Kristi himmelfart"],
  ["2027-05-15", "2027-05-17", "Pinseferie"],
];

const CHAPTERS = [
  ["Regn med store tal", "s. 4–21", ["Samtalebillede og pladsværdi", "Europas hovedstæder og Pizzaria Bellano", "Vandforbrug og GeoGebra", "Viden om store tal", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Brøker", "s. 22–41", ["Samtalebillede og brøkforståelse", "Bager Lucas, Byfesten og Chokoladebutikken", "Brøkræs og opskrifter", "Viden om brøker", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Vinkler og figurer", "s. 42–63", ["Samtalebillede og vinkler", "Glarmesteren og drager", "Byg og mål vinkler", "Viden om vinkler og figurer", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Negative tal og koordinatsystemet", "s. 64–83", ["Samtalebillede og tallinje", "Krigsskib, kulde og ballonfærden", "Talrækker og stjerneløb", "Viden om koordinater", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Decimaltal og procent", "s. 84–105", ["Samtalebillede og decimaltal", "Cykelturen, priser og Bio Hollywood", "Priser, reklamer og procent", "Viden om decimaltal og procent", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Rumfang og flade", "s. 106–125", ["Samtalebillede og kasser", "Boligbyggeri, vintervarme og Aqualand", "Vingummiæsker og rumfang", "Viden om rumfang og flade", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Tal og bogstaver", "s. 126–143", ["Samtalebillede og mønstre", "Nyt torv, Thomsens tal og indhegning", "Skridtformel og figurtal", "Viden om variable og ligninger", "Breddeopgaver", "Eftertanken og EVA"]],
  ["Data og chance", "s. 144–164", ["Samtalebillede og data", "De sidste tigre og Fuglested dyrehandel", "Terning Royale og undersøgelser", "Viden om data og chance", "Breddeopgaver", "Eftertanken og EVA"]],
] as const;
const TRAINING_START = [4, 12, 20, 28, 36, 44, 50, 56];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const inHoliday = (d: Date) => HOLIDAYS.find(([from, to]) => iso(d) >= from && iso(d) <= to)?.[2];
const isTeachingDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5 && !inHoliday(d);
const phaseFor = (lesson: number) => lesson <= 2 ? 0 : lesson <= 6 ? 1 : lesson <= 8 ? 2 : lesson === 9 ? 3 : lesson <= 11 ? 4 : 5;
const phaseEnd = (lesson: number) => [2, 6, 8, 9, 11, 12].find((end) => lesson <= end) ?? 12;

function buildGrade5Events(): CalendarEvent[] {
  const raw: Omit<CalendarEvent, "review" | "doNow" | "homework" | "due">[] = [];
  let date = new Date(2026, 7, 20);
  let chapter = 0;
  let lesson = 1;
  while (chapter < CHAPTERS.length) {
    if (isTeachingDay(date) && [1, 2, 4].includes(date.getDay())) {
      const capacity = date.getDay() === 1 ? 1 : 2;
      const units = Math.min(capacity, 13 - lesson, phaseEnd(lesson) - lesson + 1);
      const [name, pages, phases] = CHAPTERS[chapter];
      raw.push({
        date: iso(date), minutes: units * 45, chapter: chapter + 1,
        title: `Kapitel ${chapter + 1}: ${name}`,
        detail: `Lektion ${lesson}${units === 2 ? `–${lesson + 1}` : ""} af 12 · ${phases[phaseFor(lesson)]} · ${pages}`,
      });
      lesson += units;
      if (lesson === 13) { chapter += 1; lesson = 1; }
    }
    date = addDays(date, 1);
  }
  return raw.map((event, index) => {
    const lessonMatch = event.detail.match(/Lektion (\d+)/);
    const lesson = Number(lessonMatch?.[1] ?? 1);
    const trainingPage = TRAINING_START[event.chapter - 1] + Math.min(4, Math.floor((lesson - 1) / 2));
    const next = raw[index + 1];
    const due = next ? new Date(`${next.date}T12:00:00`) : null;
    const extra = event.chapter === 1 && lesson >= 4 && lesson <= 8
      ? "Brug ekstraarket ‘Hjælpeark Europas hovedstæder’ til elever, der ikke kan komme i gang."
      : lesson === 9 ? "Brug kapitlets ‘Viden om’-side og lad eleverne markere regel og eksempel med to farver."
      : lesson === 12 ? "Brug EVA-arket og facit kun efter eleverne har afleveret deres eget svar."
      : "Brug ingen ekstraark, medmindre en elev har brug for et hjælpeark.";
    const homework = lesson === 12
      ? "Ingen ny lektie. Kapitlet afsluttes med EVA og eftertanke."
      : `Træningshæfte s. ${trainingPage}: lav de opgaver, der hører til dagens emne. Skriv mellemregning i hæftet.`;
    return {
      ...event,
      review: index === 0 ? "Ingen lektie — dette er årets første planlagte KonteXt+-lektion." : raw[index - 1].chapter === event.chapter ? `Træningshæfte: ${TRAINING_START[event.chapter - 1] + Math.min(4, Math.floor((Math.max(1, lesson - 2) - 1) / 2))}. Gennemgå svar og rettearbejde først.` : "Ingen lektie fra et nyt kapitel. Brug 5 minutter på at hente viden frem fra det afsluttede kapitel.",
      doNow: `Grundbog ${event.detail}. Derefter arbejder eleverne i træningshæftet på s. ${trainingPage}. ${extra}`,
      homework,
      due: due ? `${WEEKDAYS[(due.getDay() + 6) % 7]}. ${due.getDate()}. ${MONTHS[due.getMonth()].toLowerCase()}` : "næste undervisningsdag",
    };
  });
}

const EVENTS_5 = buildGrade5Events();

function formatDate(date: Date) { return `${WEEKDAYS[(date.getDay() + 6) % 7]}. ${date.getDate()}. ${MONTHS[date.getMonth()].toLowerCase()}`; }

export default function Home() {
  const [grade, setGrade] = useState<ClassName>("5. klasse");
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date(2026, 7, 24));
  const events = grade === "5. klasse" ? EVENTS_5 : [];
  const eventsByDate = useMemo(() => new Map(events.map((event) => [event.date, event])), [events]);
  const weekStart = monday(cursor);
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = monday(first);
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const previous = () => setCursor(view === "month" ? new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1) : addDays(cursor, -7));
  const next = () => setCursor(view === "month" ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) : addDays(cursor, 7));

  return <main>
    <header className="hero">
      <div><p className="eyebrow">SKOLEÅRET 2026 / 27</p><h1>Min undervisningskalender</h1><p>Planlægning, ferier og matematik samlet ét sted.</p></div>
      <div className="class-switch" aria-label="Vælg klasse">
        {(["5. klasse", "7. klasse"] as ClassName[]).map((name) => <button key={name} onClick={() => setGrade(name)} className={grade === name ? "active" : ""}>{name}</button>)}
      </div>
    </header>

    <section className="toolbar" aria-label="Kalenderstyring">
      <div className="view-switch"><button onClick={() => setView("month")} className={view === "month" ? "selected" : ""}>Måned</button><button onClick={() => setView("week")} className={view === "week" ? "selected" : ""}>Uge</button></div>
      <div className="navigator"><button aria-label="Forrige" onClick={previous}>‹</button><strong>{view === "month" ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}` : `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6))}`}</strong><button aria-label="Næste" onClick={next}>›</button></div>
      <button className="today" onClick={() => setCursor(new Date(2026, 7, 24))}>Til denne uge</button>
    </section>

    {grade === "7. klasse" ? <section className="empty"><p className="eyebrow">7. KLASSE · MATERIALER KLAR</p><h2>Jeg mangler kun dit skema</h2><p>Grundbogen begynder med kapitlet <strong>Tallene</strong> (s. 4), og træningshæftet er registreret. Skriv blot hvilke ugedage og hvor mange minutter du har 7. klasse, så får den samme daglige struktur: “Til i dag” → gennemgang → aktivitet → “Til næste gang”.</p></section> : view === "month" ? <section className="calendar-card">
      <div className="weekday-row">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
      <div className="month-grid">{monthDays.map((day) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day); const outside = day.getMonth() !== cursor.getMonth();
        return <button key={iso(day)} className={`day ${outside ? "outside" : ""} ${holiday ? "holiday" : ""} ${event ? "planned" : ""}`} onClick={() => { setCursor(day); setView("week"); }}>
          <span className="day-number">{day.getDate()}</span>{holiday && <span className="holiday-label">{holiday}</span>}{event && <span className="event-pill">M · {event.minutes} min</span>}
        </button>;
      })}</div>
    </section> : <section className="week-card">
      {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day);
        return <article key={iso(day)} className={`week-day ${event ? "has-event" : ""}`}><div className="week-date"><span>{WEEKDAYS[i]}</span><strong>{day.getDate()}</strong><small>{MONTHS[day.getMonth()].toLowerCase()}</small></div>{holiday ? <p className="holiday-text">{holiday}</p> : event ? <div className={`event chapter-${event.chapter}`}><p>{event.minutes} minutter</p><h3>{event.title}</h3><span>{event.detail}</span><div className="agenda"><b>Til i dag</b><p>{event.review}</p><b>Derefter</b><p>{event.doNow}</p><b>Til {event.due}</b><p>{event.homework}</p></div></div> : <p className="no-event">Ingen fast matematiktime</p>}</article>;
      })}
    </section>}

    <section className="legend"><span><i className="dot maths" /> Matematik – 5. klasse</span><span><i className="dot holiday-dot" /> Skoleferie</span><span>Fast skema: mandag 45 min. · tirsdag 90 min. · torsdag 90 min.</span></section>
  </main>;
}
