"use client";

import { useMemo, useState } from "react";

type ClassName = "5. klasse" | "7. klasse";
type CalendarEvent = { date: string; minutes: number; title: string; detail: string; chapter: number; book: string; workbook: string; review: string; doNow: string; homework: string; due: string };
type LessonMaterial = { book: string; workbook: string; homework: string };

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
const CHAPTERS_7 = [
  ["Tallene", "grundbog s. 4–21"], ["Forhold og figurer", "grundbog s. 22–41"],
  ["Regn med tallene", "grundbog s. 42–67"], ["Data og chance", "grundbog s. 68–89"],
  ["Formler og ligninger", "grundbog s. 90–107"], ["Flade og rum", "grundbog s. 108–123"],
  ["Sammenhænge og grafer", "grundbog s. 124–141"], ["Mønstre og figurer", "grundbog s. 142–slut"],
] as const;
const GRADE_5_CHAPTER_1: LessonMaterial[] = [
  { book: "Grundbog s. 4-5: samtalebillede og klasseaktiviteten.", workbook: "Øvehæfte s. 4, opg. 1-3.", homework: "Grundbog s. 18, Breddeopgaver opg. 1-4." },
  { book: "Grundbog s. 6: Europas hovedstæder, opg. 1-3.", workbook: "Øvehæfte s. 4, opg. 4-6.", homework: "Grundbog s. 18, Breddeopgaver opg. 5-8." },
  { book: "Grundbog s. 7: Europas hovedstæder, opg. 4-7.", workbook: "Øvehæfte s. 5, opg. 7-9.", homework: "Grundbog s. 18, Breddeopgaver opg. 9-12." },
  { book: "Grundbog s. 8: Europas hovedstæder, opg. 8-10.", workbook: "Øvehæfte s. 5, opg. 10-12.", homework: "Grundbog s. 18, Breddeopgaver opg. 13-17." },
  { book: "Grundbog s. 9: Europas hovedstæder, opg. 11-12.", workbook: "Øvehæfte s. 6, opg. 1-3.", homework: "Grundbog s. 19, Breddeopgaver opg. 18-21." },
  { book: "Grundbog s. 10-11: Pizzaria Bellano, opg. 1-6.", workbook: "Øvehæfte s. 6, opg. 4-6.", homework: "Grundbog s. 19, Breddeopgaver opg. 22-25." },
  { book: "Grundbog s. 12: Pizzaria Bellano, opg. 7-10.", workbook: "Øvehæfte s. 7, opg. 7-9.", homework: "Grundbog s. 19, Breddeopgaver opg. 26-29." },
  { book: "Grundbog s. 13: Pizzaria Bellano, opg. 11-13 og Udfordringen.", workbook: "Øvehæfte s. 7, opg. 10-13.", homework: "Grundbog s. 19, Breddeopgaver opg. 30-34." },
  { book: "Grundbog s. 14-15: Start et hundelufterfirma samt aktiviteterne Vandforbrug og Lommeregneren.", workbook: "Øvehæfte s. 8, opg. 14-16.", homework: "Grundbog s. 20, Breddeopgaver opg. 35-38." },
  { book: "Grundbog s. 16-17: Viden om talsystem, regnearter, overslag, afrunding og regnemetoder.", workbook: "Øvehæfte s. 8, opg. 17-18.", homework: "Grundbog s. 20, Breddeopgaver opg. 39-42." },
  { book: "Grundbog s. 18-19: Breddeopgaver opg. 1-34.", workbook: "Øvehæfte s. 8, opg. 19-20.", homework: "Grundbog s. 20, Breddeopgaver opg. 43-48." },
  { book: "Grundbog s. 20-21: Breddeopgaver opg. 35-48 og Eftertanken.", workbook: "Øvehæfte s. 9, Læs og forstå, opg. 1-3.", homework: "Ingen ny lektie. Kapitel 1 er afsluttet." },
];

const GRADE_7_CHAPTER_1: LessonMaterial[] = [
  { book: "Grundbog s. 4-5: samtalebillede og klasseaktiviteten Gæt en rækkefølge.", workbook: "Øvehæfte s. 2, opg. 1-3.", homework: "Grundbog s. 18, Breddeopgaver opg. 1-4." },
  { book: "Grundbog s. 6-7: Populære film, opg. 1-5.", workbook: "Øvehæfte s. 2, opg. 4-6.", homework: "Grundbog s. 18, Breddeopgaver opg. 5-8." },
  { book: "Grundbog s. 8-9: Populære film, opg. 6-9.", workbook: "Øvehæfte s. 2, opg. 7-8.", homework: "Grundbog s. 18, Breddeopgaver opg. 9-12." },
  { book: "Grundbog s. 10-11: Populære film, opg. 10-15 og Udfordringen.", workbook: "Øvehæfte s. 3, opg. 9-10.", homework: "Grundbog s. 18, Breddeopgaver opg. 13-17." },
  { book: "Grundbog s. 12-13: Støvmider, opg. 1-6.", workbook: "Øvehæfte s. 3, opg. 11-12.", homework: "Grundbog s. 19, Breddeopgaver opg. 18-22." },
  { book: "Grundbog s. 14-15: Fra brøktal og decimaltal til procent samt aktiviteten Hvor mange risikerer?.", workbook: "Øvehæfte s. 4, opg. 13-15.", homework: "Grundbog s. 19, Breddeopgaver opg. 23-27." },
  { book: "Grundbog s. 16-17: Viden om brøker, decimaltal, procent og potenser.", workbook: "Øvehæfte s. 4, opg. 16-18.", homework: "Grundbog s. 19, Breddeopgaver opg. 28-32." },
  { book: "Grundbog s. 18: Breddeopgaver opg. 1-17.", workbook: "Øvehæfte s. 5, opg. 19-20.", homework: "Grundbog s. 19, Breddeopgaver opg. 33-36." },
  { book: "Grundbog s. 19: Breddeopgaver opg. 18-36.", workbook: "Øvehæfte s. 5, opg. 21-22.", homework: "Grundbog s. 20, Breddeopgaver opg. 37-41." },
  { book: "Grundbog s. 20: Breddeopgaver opg. 37-53.", workbook: "Øvehæfte s. 5, opg. 23.", homework: "Grundbog s. 20, Breddeopgaver opg. 42-46." },
  { book: "Grundbog s. 21: Eftertanken og mundtlig forklaring.", workbook: "Øvehæfte s. 5, opg. 24-25.", homework: "Grundbog s. 20, Breddeopgaver opg. 47-53." },
  { book: "Grundbog s. 21: fælles opsamling og evaluering af Eftertanken.", workbook: "Øvehæfte s. 5, opg. 24-25 færdiggøres og rettes.", homework: "Ingen ny lektie. Kapitel 1 er afsluttet." },
];

const GRADE_7_CHAPTER_2: LessonMaterial[] = [
  { book: "Grundbog s. 23: kapitelintro og klasseaktiviteten Tegn et sted.", workbook: "Øvehæfte s. 6, opg. 1.", homework: "Øvehæfte s. 6, opg. 1 færdiggøres." },
  { book: "Grundbog s. 24-25: Havnen.", workbook: "Øvehæfte s. 6, opg. 2-3.", homework: "Øvehæfte s. 6, opg. 2-3 færdiggøres." },
  { book: "Grundbog s. 26-27: Øerne.", workbook: "Øvehæfte s. 7, opg. 4.", homework: "Øvehæfte s. 7, opg. 4 færdiggøres." },
  { book: "Grundbog s. 28-29: øvelser med målestoksforhold og tangens.", workbook: "Øvehæfte s. 7, opg. 5.", homework: "Øvehæfte s. 7, opg. 5 færdiggøres." },
  { book: "Grundbog s. 30-31: Fra tegning til konstruktion og Undersøg figurens størrelse.", workbook: "Øvehæfte s. 8, opg. 6.", homework: "Øvehæfte s. 8, opg. 6 færdiggøres." },
  { book: "Grundbog s. 32-33: Softballbane og Gæt en længde.", workbook: "Øvehæfte s. 8, opg. 7.", homework: "Øvehæfte s. 8, opg. 7 færdiggøres." },
  { book: "Grundbog s. 34-35: Viden om forhold, målestoksforhold, længde, areal og rumfang.", workbook: "Øvehæfte s. 9, opg. 8.", homework: "Øvehæfte s. 9, opg. 8 færdiggøres." },
  { book: "Grundbog s. 36-37: Breddeopgaver.", workbook: "Øvehæfte s. 9, opg. 9-10.", homework: "Øvehæfte s. 9, opg. 9-10 færdiggøres." },
  { book: "Grundbog s. 38-39: Breddeopgaver og faglig forklaring.", workbook: "Øvehæfte s. 10, opg. 11-12.", homework: "Øvehæfte s. 10, opg. 11-12 færdiggøres." },
  { book: "Grundbog s. 40-41: kapitlets afsluttende opgaver.", workbook: "Øvehæfte s. 10, opg. 13-14.", homework: "Øvehæfte s. 10, opg. 13-14 færdiggøres." },
  { book: "Grundbog s. 40-41: opsamling og Eftertanken.", workbook: "Øvehæfte s. 11, opg. 15-16.", homework: "Øvehæfte s. 11, opg. 15-16 færdiggøres." },
  { book: "Grundbog s. 41: evaluering af kapitlet.", workbook: "Øvehæfte s. 11, opg. 17.", homework: "Ingen ny lektie. Kapitel 2 er afsluttet." },
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const inHoliday = (d: Date) => HOLIDAYS.find(([from, to]) => iso(d) >= from && iso(d) <= to)?.[2];
const isTeachingDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5 && !inHoliday(d);
const phaseFor = (lesson: number) => lesson <= 2 ? 0 : lesson <= 6 ? 1 : lesson <= 8 ? 2 : lesson === 9 ? 3 : lesson <= 11 ? 4 : 5;
const phaseEnd = (lesson: number) => [2, 6, 8, 9, 11, 12].find((end) => lesson <= end) ?? 12;

function materialForGrade5(chapter: number, lesson: number): LessonMaterial {
  if (chapter === 1) return GRADE_5_CHAPTER_1[lesson - 1];
  return {
    book: `Grundbog ${CHAPTERS[chapter - 1][1]}: den konkrete dagside findes ikke i den indlæste rensede PDF, som stopper ved s. 23.`,
    workbook: "Øvehæftets konkrete side og opgavenummer er ikke dokumenteret i de indlæste scanninger for denne lektion.",
    homework: "Ingen opgave angivet, før den manglende bogside er indlæst.",
  };
}

function materialForGrade7(chapter: number, lesson: number): LessonMaterial {
  if (chapter === 1) return GRADE_7_CHAPTER_1[lesson - 1];
  if (chapter === 2) return GRADE_7_CHAPTER_2[lesson - 1];
  return {
    book: `${CHAPTERS_7[chapter - 1][1]}: den konkrete dagside findes ikke i den indlæste rensede PDF, som stopper ved s. 43.`,
    workbook: "Øvehæftets konkrete side og opgavenummer er ikke dokumenteret i de indlæste scanninger for denne lektion.",
    homework: "Ingen opgave angivet, før den manglende bogside er indlæst.",
  };
}

function combineMaterial(materials: LessonMaterial[], key: "book" | "workbook") {
  return materials.map((material) => material[key]).join(" Derefter: ");
}

function buildGrade5Events(): CalendarEvent[] {
  const raw: Array<Omit<CalendarEvent, "book" | "workbook" | "review" | "doNow" | "homework" | "due"> & { lesson: number; units: number }> = [];
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
        lesson, units,
        title: `Kapitel ${chapter + 1}: ${name}`,
        detail: `Lektion ${lesson}${units === 2 ? `–${lesson + 1}` : ""} af 12 · ${phases[phaseFor(lesson)]} · ${pages}`,
      });
      lesson += units;
      if (lesson === 13) { chapter += 1; lesson = 1; }
    }
    date = addDays(date, 1);
  }
  return raw.map((event, index) => {
    const materials = Array.from({ length: event.units }, (_, offset) => materialForGrade5(event.chapter, event.lesson + offset));
    const lastMaterial = materials[materials.length - 1];
    const next = raw[index + 1];
    const due = next ? new Date(`${next.date}T12:00:00`) : null;
    const extra = event.chapter === 1 && event.lesson >= 4 && event.lesson <= 8
      ? "Brug ekstraarket ‘Hjælpeark Europas hovedstæder’ til elever, der ikke kan komme i gang."
      : event.lesson === 9 ? "Brug Grundbog s. 16-17 som fælles opslagsværk, når eleverne forklarer deres metode."
      : event.lesson === 12 ? "Brug EVA-arket og facit kun efter eleverne har afleveret deres eget svar."
      : "Brug ingen ekstraark, medmindre en elev har brug for et hjælpeark.";
    const previous = raw[index - 1];
    const previousHomework = previous
      ? materialForGrade5(previous.chapter, previous.lesson + previous.units - 1).homework
      : null;
    return {
      ...event,
      book: combineMaterial(materials, "book"),
      workbook: combineMaterial(materials, "workbook"),
      review: index === 0 ? "Ingen lektie — dette er årets første planlagte KonteXt+-lektion." : previousHomework ? `Til i dag havde eleverne: ${previousHomework} Gennemgå opgaverne først; eleverne retter fejl med en anden farve.` : "Ingen lektie til i dag.",
      doNow: `Gennemgå først grundbogssiderne fælles. Lad derefter eleverne løse de angivne opgaver i øvehæftet. ${extra}`,
      homework: lastMaterial.homework,
      due: due ? `${WEEKDAYS[(due.getDay() + 6) % 7]}. ${due.getDate()}. ${MONTHS[due.getMonth()].toLowerCase()}` : "næste undervisningsdag",
    };
  });
}

const EVENTS_5 = buildGrade5Events();

function buildGrade7Events(): CalendarEvent[] {
  const raw: Array<Omit<CalendarEvent, "book" | "workbook" | "review" | "doNow" | "homework" | "due"> & { lesson: number }> = [];
  let date = new Date(2026, 7, 24); let chapter = 0; let lesson = 1;
  while (chapter < CHAPTERS_7.length) {
    if (isTeachingDay(date) && [1, 2, 4, 5].includes(date.getDay())) {
      const [name, pages] = CHAPTERS_7[chapter];
      const minutes = date.getDay() === 5 ? 75 : 45;
      raw.push({ date: iso(date), minutes, chapter: chapter + 1, lesson, title: `Kapitel ${chapter + 1}: ${name}`, detail: `Lektion ${lesson} af 12 · ${pages}` });
      lesson += 1;
      if (lesson === 13) { chapter += 1; lesson = 1; }
    }
    date = addDays(date, 1);
  }
  return raw.map((event, index) => {
    const material = materialForGrade7(event.chapter, event.lesson);
    const next = raw[index + 1]; const dueDate = next ? new Date(`${next.date}T12:00:00`) : null;
    const previous = raw[index - 1];
    const previousHomework = previous ? materialForGrade7(previous.chapter, previous.lesson).homework : null;
    return {
      ...event,
      book: material.book,
      workbook: material.workbook,
      review: index === 0 ? "Ingen lektie — første time i 7. klasse-forløbet." : previousHomework ? `Til i dag havde eleverne: ${previousHomework} Gennemgå svarene først; eleverne retter én fejl med en anden farve.` : "Ingen lektie til i dag.",
      doNow: `Gennemgå først den angivne grundbogsside. Lad derefter eleverne løse præcis de angivne opgaver i øvehæftet.${event.minutes === 75 ? " Brug de sidste 30 minutter til makkerkontrol og en faglig forklaring." : ""}`,
      homework: material.homework,
      due: dueDate ? `${WEEKDAYS[(dueDate.getDay() + 6) % 7]}. ${dueDate.getDate()}. ${MONTHS[dueDate.getMonth()].toLowerCase()}` : "næste undervisningsdag",
    };
  });
}

const EVENTS_7 = buildGrade7Events();

function formatDate(date: Date) { return `${WEEKDAYS[(date.getDay() + 6) % 7]}. ${date.getDate()}. ${MONTHS[date.getMonth()].toLowerCase()}`; }

export default function Home() {
  const [grade, setGrade] = useState<ClassName>("5. klasse");
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date(2026, 7, 24));
  const events = grade === "5. klasse" ? EVENTS_5 : EVENTS_7;
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

    {view === "month" ? <section className="calendar-card">
      <div className="weekday-row">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
      <div className="month-grid">{monthDays.map((day) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day); const outside = day.getMonth() !== cursor.getMonth();
        return <button key={iso(day)} className={`day ${outside ? "outside" : ""} ${holiday ? "holiday" : ""} ${event ? "planned" : ""}`} onClick={() => { setCursor(day); setView("week"); }}>
          <span className="day-number">{day.getDate()}</span>{holiday && <span className="holiday-label">{holiday}</span>}{event && <span className="event-pill">M · {event.minutes} min</span>}
        </button>;
      })}</div>
    </section> : <section className="week-card">
      {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day, dayIndex) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day);
        return <article key={iso(day)} className={`week-day ${event ? "has-event" : ""}`}>
          <div className="week-date"><span>{WEEKDAYS[dayIndex]}</span><strong>{day.getDate()}</strong><small>{MONTHS[day.getMonth()].toLowerCase()}</small></div>
          {holiday ? <p className="holiday-text">{holiday}</p> : event ? <div className={`event chapter-${event.chapter}`}>
            <p>{event.minutes} minutter</p><h3>{event.title}</h3><span>{event.detail}</span>
            <div className="materials"><b>Slå op i grundbogen</b><p>{event.book}</p><b>Øvehæfte</b><p>{event.workbook}</p></div>
            <div className="agenda"><b>Til i dag</b><p>{event.review}</p><b>Derefter</b><p>{event.doNow}</p><b>Til {event.due}</b><p>{event.homework}</p></div>
          </div> : <p className="no-event">Ingen fast matematiktime</p>}
        </article>;
      })}
    </section>}

    <section className="legend"><span><i className="dot maths" /> Matematik – {grade}</span><span><i className="dot holiday-dot" /> Skoleferie</span><span>{grade === "5. klasse" ? "Fast skema: mandag 45 min. · tirsdag 90 min. · torsdag 90 min." : "Fast skema: mandag 9.00–9.45 · tirsdag 9.00–9.45 · torsdag 10.50–11.35 · fredag 8.30–9.45."}</span></section>
  </main>;
}
