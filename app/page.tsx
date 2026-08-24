"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../src/supabase";

type ClassName = "5. klasse" | "7. klasse";
type CalendarEvent = { date: string; minutes: number; title: string; detail: string; chapter: number; book: string; classwork: string; materials: string; review: string; doNow: string; homework: string; due: string };
type LessonMaterial = { book: string; workbook: string; homework: string };
type EditableEventFields = Pick<CalendarEvent, "book" | "classwork" | "materials" | "review" | "doNow" | "homework" | "due">;

const eventKey = (grade: ClassName, date: string) => `${grade}|${date}`;

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
  { book: "Grundbog s. 20-21: Breddeopgaver opg. 35-48 og Eftertanken.", workbook: "Øvehæfte s. 9, Læs og forstå, opg. 1-3.", homework: "Grundbog s. 20-21: løs Breddeopgaver opg. 35-48 og Eftertanken i klassen." },
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
  { book: "Grundbog s. 21: fælles opsamling og evaluering af Eftertanken.", workbook: "Øvehæfte s. 5, opg. 24-25 færdiggøres og rettes.", homework: "Grundbog s. 20-21: afslut Breddeopgaver opg. 47-53 og Eftertanken i klassen." },
];

const GRADE_7_CHAPTER_2: LessonMaterial[] = [
  { book: "Grundbog s. 23: kapitelintro og klasseaktiviteten Tegn et sted.", workbook: "Øvehæfte s. 6, opg. 1.", homework: "Grundbog s. 23: gennemfør klasseaktiviteten Tegn et sted i klassen." },
  { book: "Grundbog s. 24-25: Havnen.", workbook: "Øvehæfte s. 6, opg. 2-3.", homework: "Grundbog s. 24-25: løs Havnen-opgaverne i klassen." },
  { book: "Grundbog s. 26-27: Øerne.", workbook: "Øvehæfte s. 7, opg. 4.", homework: "Grundbog s. 26-27: løs Øerne-opgaverne i klassen." },
  { book: "Grundbog s. 28-29: øvelser med målestoksforhold og tangens.", workbook: "Øvehæfte s. 7, opg. 5.", homework: "Grundbog s. 28-29: løs øvelserne med målestoksforhold og tangens i klassen." },
  { book: "Grundbog s. 30-31: Fra tegning til konstruktion og Undersøg figurens størrelse.", workbook: "Øvehæfte s. 8, opg. 6.", homework: "Grundbog s. 30-31: gennemfør konstruktionsopgaverne i klassen." },
  { book: "Grundbog s. 32-33: Softballbane og Gæt en længde.", workbook: "Øvehæfte s. 8, opg. 7.", homework: "Grundbog s. 32-33: arbejd med Softballbane og Gæt en længde i klassen." },
  { book: "Grundbog s. 34-35: Viden om forhold, målestoksforhold, længde, areal og rumfang.", workbook: "Øvehæfte s. 9, opg. 8.", homework: "Grundbog s. 34-35: brug Viden om-siderne til fælles opsamling i klassen." },
  { book: "Grundbog s. 36-37: Breddeopgaver.", workbook: "Øvehæfte s. 9, opg. 9-10.", homework: "Grundbog s. 36-37: arbejd med Breddeopgaverne i klassen." },
  { book: "Grundbog s. 38-39: Breddeopgaver og faglig forklaring.", workbook: "Øvehæfte s. 10, opg. 11-12.", homework: "Grundbog s. 38-39: arbejd med Breddeopgaverne og faglig forklaring i klassen." },
  { book: "Grundbog s. 40-41: kapitlets afsluttende opgaver.", workbook: "Øvehæfte s. 10, opg. 13-14.", homework: "Grundbog s. 40-41: løs kapitlets afsluttende opgaver i klassen." },
  { book: "Grundbog s. 40-41: opsamling og Eftertanken.", workbook: "Øvehæfte s. 11, opg. 15-16.", homework: "Grundbog s. 40-41: gennemfør opsamling og Eftertanken i klassen." },
  { book: "Grundbog s. 41: evaluering af kapitlet.", workbook: "Øvehæfte s. 11, opg. 17.", homework: "Grundbog s. 41: evaluér kapitlet i klassen." },
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const inHoliday = (d: Date) => HOLIDAYS.find(([from, to]) => iso(d) >= from && iso(d) <= to)?.[2];
const isTeachingDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5 && !inHoliday(d);
const phaseFor = (lesson: number) => lesson <= 2 ? 0 : lesson <= 6 ? 1 : lesson <= 8 ? 2 : lesson === 9 ? 3 : lesson <= 11 ? 4 : 5;
const HANDOVER_DATE = "2027-04-01";
const isSuccessorDate = (date: string) => date >= HANDOVER_DATE;

function materialForGrade5(chapter: number, lesson: number): LessonMaterial {
  if (chapter === 1) return GRADE_5_CHAPTER_1[lesson - 1];
  return {
    book: `Grundbog ${CHAPTERS[chapter - 1][1]}: den konkrete dagside findes ikke i den indlæste rensede PDF, som stopper ved s. 23.`,
    workbook: "Øvehæftets konkrete side og opgavenummer er ikke dokumenteret i de indlæste scanninger for denne lektion.",
    homework: "Klassearbejdet kan ikke angives præcist, før den manglende grundbogsside er indlæst.",
  };
}

function materialForGrade7(chapter: number, lesson: number): LessonMaterial {
  if (chapter === 1) return GRADE_7_CHAPTER_1[lesson - 1];
  if (chapter === 2) return GRADE_7_CHAPTER_2[lesson - 1];
  return {
    book: `${CHAPTERS_7[chapter - 1][1]}: den konkrete dagside findes ikke i den indlæste rensede PDF, som stopper ved s. 43.`,
    workbook: "Øvehæftets konkrete side og opgavenummer er ikke dokumenteret i de indlæste scanninger for denne lektion.",
    homework: "Klassearbejdet kan ikke angives præcist, før den manglende grundbogsside er indlæst.",
  };
}

function combineMaterial(materials: LessonMaterial[], key: "book" | "workbook") {
  return materials.map((material) => material[key]).join(" Derefter: ");
}

const GRADE_5_EQUIPMENT = [
  "lommeregnere og blyanter",
  "brøkbrikker eller foldet papir, sakse og farveblyanter",
  "linealer, vinkelmålere, passere og ternet papir",
  "linealer og et stort koordinatsystem på tavlen",
  "lommeregnere og pris-/procentkort skrevet på tavlen",
  "linealer, målebånd og mindst tre forskellige papkasser",
  "tændstikker eller centicubes til figurmønstre",
  "to terninger pr. makkerpar og farveblyanter",
] as const;

function materialsForGrade5(chapter: number, lesson: number, practice: boolean): string {
  if (chapter === 1) {
    if (practice) return "PRINT: De nødvendige sider fra 24-Laerer-Hjaelpeark-samlet.pdf — kun til elever, der mangler støtte. DIGITALT: Åbn 18-GeoGebra-Hvad-sker-der-med-tallet.ggb, 19-GeoGebra-Hvordan-skrives-tallet.ggb og 20-GeoGebra-Afrund-tallene.ggb. LÆRER: Hav 28-Laerer-Facit-kernebog.pdf åbent; vis ikke facit på forhånd.";
    const preparations = [
      "PRINT: Intet. DIGITALT: Intet. LÆG FREM: Grundbog og øvehæfte til hver elev samt blyanter.",
      "PRINT: 01-Hjaelpeark-Europas-hovedstaeder-1.pdf til elever, der har brug for støtte. DIGITALT: Åbn 05-Regneark-Europas-hovedstaeder.xlsx på lærercomputeren. LÆG FREM: Lommeregnere.",
      "PRINT: 02-Hjaelpeark-Europas-hovedstaeder-2.pdf til elever, der har brug for støtte. DIGITALT: Åbn 05-Regneark-Europas-hovedstaeder.xlsx. LÆG FREM: Lommeregnere.",
      "PRINT: 03-Hjaelpeark-Europas-hovedstaeder-3.pdf til elever, der har brug for støtte. DIGITALT: Åbn 21-GeoGebra-Populaere-hovedstaeder.ggb og afprøv filen før timen. LÆG FREM: Én computer pr. makkerpar, hvis eleverne selv skal bruge filen.",
      "PRINT: 04-Hjaelpeark-Europas-hovedstaeder-4.pdf til elever, der har brug for støtte. DIGITALT: Åbn 21-GeoGebra-Populaere-hovedstaeder.ggb. LÆG FREM: Lommeregnere.",
      "PRINT: Intet. DIGITALT: Åbn 06-Regneark-Pizzaria-Bellano.xlsx og kontrollér, at det kan vises på projektoren. LÆG FREM: Lommeregnere.",
      "PRINT: Intet. DIGITALT: Åbn 06-Regneark-Pizzaria-Bellano.xlsx. LÆG FREM: Lommeregnere og kladdepapir.",
      "PRINT: Intet. DIGITALT: Åbn 06-Regneark-Pizzaria-Bellano.xlsx. LÆG FREM: Lommeregnere; eleverne skal kunne vise mellemregninger på papir.",
      "PRINT: Intet. DIGITALT: Åbn 07-Regneark-Vandforbrug.xlsx og 18-GeoGebra-Hvad-sker-der-med-tallet.ggb; afprøv begge før timen. LÆG FREM: Én computer pr. makkerpar og lommeregnere.",
      "PRINT: 08-Viden-om-Regn-med-store-tal.pdf til elever, der har brug for et løst opslagsark. DIGITALT: Åbn 19-GeoGebra-Hvordan-skrives-tallet.ggb og 20-GeoGebra-Afrund-tallene.ggb. LÆG FREM: Én computer pr. makkerpar.",
      "PRINT: Fem eksemplarer af 09-Serviceark-Taltavle.pdf og fem af 10-Serviceark-Gangetavle.pdf til støttebordet. DIGITALT: Intet. LÆRER: Hav 28-Laerer-Facit-kernebog.pdf åbent på din egen skærm.",
      "PRINT: 25-Laerer-EVA-ark.pdf — ét eksemplar pr. elev. DIGITALT: Intet. LÆRER: Læs 26-Laerer-Vejledning-til-EVA-ark.pdf før timen, og hav 27-Laerer-Facit-EVA-ark.pdf klar uden at vise det til eleverne.",
    ];
    return preparations[lesson - 1];
  }

  const folder = `Kontext5/chapter_${chapter}`;
  const equipment = GRADE_5_EQUIPMENT[chapter - 1];
  if (practice) return `PRINT: Relevante støttesider fra ${folder}/teacher_kontext5_kap${chapter}_hjaelpeark.pdf — kun til elever, der stadig mangler en metode. DIGITALT: Ingen GeoGebra-fil til dette kapitel er registreret i projektmappen. LÆRER: Hav kapitlets facit åbent. LÆG FREM: ${equipment}.`;
  if (lesson === 1) return `PRINT: Intet. DIGITALT: Åbn ${folder}/teacher_kontext5_kap${chapter}_læringsmål_til_årsplan.pdf på din egen skærm. LÆG FREM: ${equipment}.`;
  if (lesson >= 2 && lesson <= 8) return `PRINT: De relevante sider fra ${folder}/teacher_kontext5_kap${chapter}_hjaelpeark.pdf til de elever, der har brug for støtte; ikke et klassesæt. DIGITALT: Ingen GeoGebra-fil til denne dag er registreret i projektmappen. LÆG FREM: ${equipment}.`;
  if (lesson === 12) return `PRINT: ${folder}/teacher_kontext5_kap${chapter}_evaark.pdf — ét eksemplar pr. elev. DIGITALT: Intet. LÆRER: Læs teacher_kontext5_kap${chapter}-EVAvejledning.pdf, og hav teacher_kontext5_kap${chapter}_facit_til_eva-ark.pdf klar uden at vise det. LÆG FREM: ${equipment}.`;
  return `PRINT: Intet. DIGITALT: Ingen GeoGebra-fil til denne dag er registreret i projektmappen. LÆRER: Hav ${folder}/teacher_kontext5_kap${chapter}_facit_kernebog.pdf åbent på din egen skærm. LÆG FREM: ${equipment}.`;
}

const GRADE_7_EQUIPMENT = [
  "lommeregnere og kladdepapir",
  "linealer, vinkelmålere, passere og målebånd",
  "lommeregnere og kladdepapir",
  "to terninger pr. makkerpar, linealer og farveblyanter",
  "lommeregnere og små kort til formler/ligninger",
  "linealer, målebånd og kasser eller prismer",
  "linealer, ternet papir og en computer pr. makkerpar",
  "centicubes eller tændstikker, linealer og ternet papir",
] as const;

function materialsForGrade7(chapter: number, lesson: number, practice: boolean): string {
  const equipment = GRADE_7_EQUIPMENT[chapter - 1];
  if (practice) return `PRINT: Intet — brug breddeopgaverne i grundbogen. DIGITALT: Der er ingen 7.-klasse-GeoGebra-fil registreret i projektmappen til denne dag. LÆG FREM: ${equipment}.`;
  if (chapter === 2 && lesson <= 7) return "PRINT: Intet. DIGITALT: Ingen GeoGebra-fil er registreret til dagen. LÆG FREM: Lineal, vinkelmåler og passer til hver elev, målebånd til hvert makkerpar og én lommeregner pr. elev.";
  if (chapter === 4 && lesson >= 3 && lesson <= 8) return "PRINT: Intet. DIGITALT: Klargør et tomt regneark på projektoren til klassens data; ingen færdig fil er registreret i projektmappen. LÆG FREM: To terninger pr. makkerpar og farveblyanter.";
  if (chapter === 7 && lesson >= 3 && lesson <= 8) return "PRINT: Ternet papir til de elever, der ikke skriver i kladdehæfte. DIGITALT: Åbn et tomt GeoGebra-vindue og kontrollér akser samt gitter før timen; der er ingen færdig .ggb-fil i projektmappen. LÆG FREM: Linealer og én computer pr. makkerpar.";
  if (lesson === 12) return `PRINT: Intet — der ligger ikke et særskilt 7.-klasse-EVA-ark i projektmappen. DIGITALT: Intet. LÆG FREM: ${equipment}; brug elevernes grundbog og øvehæfte til evalueringen.`;
  return `PRINT: Intet. DIGITALT: Ingen GeoGebra-fil til denne dag er registreret i projektmappen. LÆG FREM: ${equipment}.`;
}

function buildGrade5Events(): CalendarEvent[] {
  const raw: Array<Omit<CalendarEvent, "book" | "classwork" | "materials" | "review" | "doNow" | "homework" | "due"> & { lesson: number; units: number; practice: boolean }> = [];
  let date = new Date(2026, 7, 20);
  let chapter = 0;
  let lesson = 1;
  let consolidation = 0;
  while (chapter < CHAPTERS.length) {
    if (isTeachingDay(date) && [1, 2, 4].includes(date.getDay())) {
      const units = 1;
      const minutes = date.getDay() === 1 ? 45 : 90;
      const [name, pages, phases] = CHAPTERS[chapter];
      if (consolidation > 0) {
        raw.push({
          date: iso(date), minutes, chapter: chapter + 1, lesson: 12, units, practice: true,
          title: `Værkstedsblok efter kapitel ${chapter + 1}: ${name}`,
          detail: `Supplerende opsamling · tæller ikke som en af kapitlets 12 kernelektioner · ${pages}`,
        });
        consolidation -= 1;
        if (consolidation === 0) { chapter += 1; lesson = 1; }
      } else {
        raw.push({
          date: iso(date), minutes, chapter: chapter + 1,
          lesson, units, practice: false,
          title: `Kapitel ${chapter + 1}: ${name}`,
          detail: `Lektion ${lesson} af 12 · ${phases[phaseFor(lesson)]} · ${pages}`,
        });
        lesson += units;
        if (lesson === 13) { consolidation = 2; lesson = 12; }
      }
    }
    date = addDays(date, 1);
  }
  return raw.map((event, index) => {
    const materials = Array.from({ length: event.units }, (_, offset) => materialForGrade5(event.chapter, event.lesson + offset));
    const lastMaterial = materials[materials.length - 1];
    const classwork = materials.map((material) => material.homework).join(" Derefter: ");
    const next = raw[index + 1];
    const due = next ? new Date(`${next.date}T12:00:00`) : null;
    const extra = event.chapter === 1 && event.lesson >= 4 && event.lesson <= 8
      ? "Brug ekstraarket ‘Hjælpeark Europas hovedstæder’ til elever, der ikke kan komme i gang."
      : event.lesson === 9 ? "Brug Grundbog s. 16-17 som fælles opslagsværk, når eleverne forklarer deres metode."
      : event.lesson === 12 ? "Brug EVA-arket og facit kun efter eleverne har afleveret deres eget svar."
      : "Brug ingen ekstraark, medmindre en elev har brug for et hjælpeark.";
    const previous = raw[index - 1];
    const assignedHomework = event.practice
      ? `${lastMaterial.workbook} Ret alle fejl i disse opgaver, og skriv mindst én mellemregning eller faglig forklaring i øvehæftet.`
      : lastMaterial.workbook;
    const previousHomework = previous ? (() => {
      const previousMaterial = materialForGrade5(previous.chapter, previous.lesson + previous.units - 1);
      return previous.practice
        ? `${previousMaterial.workbook} Ret alle fejl i disse opgaver, og skriv mindst én mellemregning eller faglig forklaring i øvehæftet.`
        : previousMaterial.workbook;
    })() : null;
    return {
      ...event,
      book: combineMaterial(materials, "book"),
      classwork,
      materials: materialsForGrade5(event.chapter, event.lesson, event.practice),
      review: index === 0 ? "Ingen lektie — dette er årets første planlagte KonteXt+-lektion." : previousHomework ? `Til i dag havde eleverne: ${previousHomework} Gennemgå opgaverne først; eleverne retter fejl med en anden farve.` : "Ingen lektie til i dag.",
      doNow: event.practice
        ? `1) Gennemgå og ret lektien i øvehæftet. 2) Færdiggør i klassen: ${classwork} 3) Brug de resterende minutter til makkerforklaring, GeoGebra eller det angivne ekstraark. ${extra}`
        : `1) Gennemgå ${combineMaterial(materials, "book")} 2) Klassen arbejder med ${classwork} 3) ${extra}`,
      homework: assignedHomework,
      due: due ? `${WEEKDAYS[(due.getDay() + 6) % 7]}. ${due.getDate()}. ${MONTHS[due.getMonth()].toLowerCase()}` : "næste undervisningsdag",
    };
  });
}

const EVENTS_5 = buildGrade5Events();

function buildGrade7Events(): CalendarEvent[] {
  const raw: Array<Omit<CalendarEvent, "book" | "classwork" | "materials" | "review" | "doNow" | "homework" | "due"> & { lesson: number; practice: boolean }> = [];
  let date = new Date(2026, 7, 24); let chapter = 0; let lesson = 1; let consolidation = 0;
  while (chapter < CHAPTERS_7.length) {
    if (isTeachingDay(date) && [1, 2, 4, 5].includes(date.getDay())) {
      if (date.getDay() === 5) {
        const practiceChapter = lesson === 1 && chapter > 0 ? chapter - 1 : chapter;
        const practiceLesson = consolidation > 0 ? 12 : lesson === 1 && chapter > 0 ? 12 : Math.max(1, lesson - 1);
        const [name, pages] = CHAPTERS_7[practiceChapter];
        raw.push({
          date: iso(date), minutes: 75, chapter: practiceChapter + 1, lesson: practiceLesson, practice: true,
          title: `Øveblok: ${name}`,
          detail: `Fredagsblok · breddeopgaver, faglig forklaring og rettelser · ${pages}`,
        });
      } else {
        const [name, pages] = CHAPTERS_7[chapter];
        if (consolidation > 0) {
          raw.push({
            date: iso(date), minutes: 45, chapter: chapter + 1, lesson: 12, practice: true,
            title: `Værkstedsblok efter kapitel ${chapter + 1}: ${name}`,
            detail: `Supplerende opsamling · tæller ikke som en af kapitlets 12 kernelektioner · ${pages}`,
          });
          consolidation -= 1;
          if (consolidation === 0) { chapter += 1; lesson = 1; }
        } else {
          raw.push({
            date: iso(date), minutes: 45, chapter: chapter + 1, lesson, practice: false,
            title: `Kapitel ${chapter + 1}: ${name}`,
            detail: `Lektion ${lesson} af 12 · ${pages}`,
          });
          lesson += 1;
          if (lesson === 13) { consolidation = 2; lesson = 12; }
        }
      }
    }
    date = addDays(date, 1);
  }
  return raw.map((event, index) => {
    const material = materialForGrade7(event.chapter, event.lesson);
    const classwork = material.homework;
    const assignedHomework = event.practice
      ? `${material.workbook} Ret alle fejl i disse opgaver, og skriv mindst én mellemregning eller faglig forklaring i øvehæftet.`
      : material.workbook;
    const next = raw[index + 1]; const dueDate = next ? new Date(`${next.date}T12:00:00`) : null;
    const previous = raw[index - 1];
    const previousHomework = previous
      ? previous.practice
        ? `${materialForGrade7(previous.chapter, previous.lesson).workbook} Ret alle fejl i disse opgaver, og skriv mindst én mellemregning eller faglig forklaring i øvehæftet.`
        : materialForGrade7(previous.chapter, previous.lesson).workbook
      : null;
    return {
      ...event,
      book: material.book,
      classwork,
      materials: materialsForGrade7(event.chapter, event.lesson, event.practice),
      review: index === 0 ? "Ingen lektie — første time i 7. klasse-forløbet." : previousHomework ? `Til i dag havde eleverne: ${previousHomework} Gennemgå svarene først; eleverne retter én fejl med en anden farve.` : "Ingen lektie til i dag.",
      doNow: event.practice
        ? `1) Gennemgå og ret torsdagens lektie i øvehæftet. 2) Klassen arbejder med ${classwork} 3) Brug resten af tiden til makkerkontrol og en mundtlig faglig forklaring.`
        : `1) Gennemgå ${material.book} 2) Klassen arbejder med ${classwork}`,
      homework: assignedHomework,
      due: dueDate ? `${WEEKDAYS[(dueDate.getDay() + 6) % 7]}. ${dueDate.getDate()}. ${MONTHS[dueDate.getMonth()].toLowerCase()}` : "næste undervisningsdag",
    };
  });
}

const EVENTS_7 = buildGrade7Events();

function formatDate(date: Date) { return `${WEEKDAYS[(date.getDay() + 6) % 7]}. ${date.getDate()}. ${MONTHS[date.getMonth()].toLowerCase()}`; }

function EventPanel({ event, grade, children }: { event: CalendarEvent; grade: ClassName; children?: React.ReactNode }) {
  return <div className={`event chapter-${event.chapter} ${isSuccessorDate(event.date) ? "successor-event" : ""}`}>
    <div className="event-topline"><span className="grade-badge">{grade}</span><span>{event.minutes} minutter</span></div>
    {isSuccessorDate(event.date) && <span className="handover-badge">Plan til efterfølgeren</span>}
    <h3>{event.title}</h3><span>{event.detail}</span>
    <div className="materials"><b>Gennemgå i grundbogen</b><p>{event.book}</p><b>Arbejde i klassen</b><p>{event.classwork}</p></div>
    <div className="preparation"><b>MATERIALER</b><p>{event.materials}</p></div>
    <div className="agenda"><b>Til i dag</b><p>{event.review}</p><b>Derefter</b><p>{event.doNow}</p><b>Til {event.due}</b><p>{event.homework}</p></div>
    {children}
  </div>;
}

export default function Home() {
  const [grade, setGrade] = useState<ClassName>("5. klasse");
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = useState(new Date(2026, 7, 24));
  const [overrides, setOverrides] = useState<Record<string, EditableEventFields>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableEventFields | null>(null);
  const [saving, setSaving] = useState(false);
  const events5 = useMemo(() => EVENTS_5.map((event) => ({ ...event, ...overrides[eventKey("5. klasse", event.date)] })), [overrides]);
  const events7 = useMemo(() => EVENTS_7.map((event) => ({ ...event, ...overrides[eventKey("7. klasse", event.date)] })), [overrides]);
  const events = grade === "5. klasse" ? events5 : events7;
  const eventsByDate = useMemo(() => new Map(events.map((event) => [event.date, event])), [events]);
  const events5ByDate = useMemo(() => new Map(events5.map((event) => [event.date, event])), [events5]);
  const events7ByDate = useMemo(() => new Map(events7.map((event) => [event.date, event])), [events7]);
  const weekStart = monday(cursor);
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = monday(first);
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const previous = () => setCursor(view === "month" ? new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1) : addDays(cursor, view === "week" ? -7 : -1));
  const next = () => setCursor(view === "month" ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) : addDays(cursor, view === "week" ? 7 : 1));
  const navigatorLabel = view === "month"
    ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
    : view === "week"
      ? `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6))}`
      : `${formatDate(cursor)} ${cursor.getFullYear()}`;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (nextSession) { setAuthOpen(false); setAuthMessage(""); }
    });
    supabase.from("calendar_overrides").select("id,grade,event_date,book,classwork,materials,review,do_now,homework,due").then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setSyncError("Kalenderen kunne ikke hente gemte ændringer fra Supabase endnu.");
        return;
      }
      const loaded: Record<string, EditableEventFields> = {};
      for (const row of data ?? []) {
        loaded[row.id] = { book: row.book, classwork: row.classwork, materials: row.materials, review: row.review, doNow: row.do_now, homework: row.homework, due: row.due };
      }
      setOverrides(loaded);
      setSyncError("");
    });
    return () => { active = false; authListener.subscription.unsubscribe(); };
  }, []);

  const sendLoginLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthMessage("Sender login-link …");
    const redirectTo = new URL(import.meta.env.BASE_URL, window.location.href).href;
    const { error } = await supabase.auth.signInWithOtp({ email: authEmail.trim(), options: { emailRedirectTo: redirectTo } });
    setAuthMessage(error ? `Login kunne ikke sendes: ${error.message}` : "Login-linken er sendt. Åbn den i din mail på denne enhed.");
  };

  const startEditing = (event: CalendarEvent, eventGrade: ClassName) => {
    setEditingId(eventKey(eventGrade, event.date));
    setDraft({ book: event.book, classwork: event.classwork, materials: event.materials, review: event.review, doNow: event.doNow, homework: event.homework, due: event.due });
  };

  const updateDraft = (field: keyof EditableEventFields, value: string) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const saveEvent = async (event: CalendarEvent, eventGrade: ClassName) => {
    if (!session || !draft) return;
    setSaving(true);
    setSyncError("");
    const id = eventKey(eventGrade, event.date);
    const row = {
      id, grade: eventGrade, event_date: event.date, book: draft.book, classwork: draft.classwork,
      materials: draft.materials, review: draft.review, do_now: draft.doNow, homework: draft.homework,
      due: draft.due, updated_by: session.user.id, updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("calendar_overrides").upsert(row);
    setSaving(false);
    if (error) {
      setSyncError(`Ændringen blev ikke gemt: ${error.message}`);
      return;
    }
    setOverrides((current) => ({ ...current, [id]: draft }));
    setEditingId(null);
    setDraft(null);
  };

  const renderEvent = (event: CalendarEvent, eventGrade: ClassName) => {
    const id = eventKey(eventGrade, event.date);
    return <EventPanel event={event} grade={eventGrade}>
      {session && editingId !== id && <button className="edit-event" onClick={() => startEditing(event, eventGrade)}>Redigér dagens plan</button>}
      {session && editingId === id && draft && <form className="edit-form" onSubmit={(submitEvent) => { submitEvent.preventDefault(); saveEvent(event, eventGrade); }}>
        <h4>Redigér {eventGrade} · {formatDate(new Date(`${event.date}T12:00:00`))}</h4>
        <label>Grundbog<textarea value={draft.book} onChange={(change) => updateDraft("book", change.target.value)} /></label>
        <label>Arbejde i klassen<textarea value={draft.classwork} onChange={(change) => updateDraft("classwork", change.target.value)} /></label>
        <label>Materialer<textarea value={draft.materials} onChange={(change) => updateDraft("materials", change.target.value)} /></label>
        <label>Til i dag<textarea value={draft.review} onChange={(change) => updateDraft("review", change.target.value)} /></label>
        <label>Derefter<textarea value={draft.doNow} onChange={(change) => updateDraft("doNow", change.target.value)} /></label>
        <label>Lektie<textarea value={draft.homework} onChange={(change) => updateDraft("homework", change.target.value)} /></label>
        <label>Afleveringsdato<input value={draft.due} onChange={(change) => updateDraft("due", change.target.value)} /></label>
        <div className="edit-actions"><button type="button" onClick={() => { setEditingId(null); setDraft(null); }}>Annuller</button><button className="save" disabled={saving}>{saving ? "Gemmer …" : "Gem i Supabase"}</button></div>
      </form>}
    </EventPanel>;
  };

  return <main>
    <header className="hero">
      <div><p className="eyebrow">SKOLEÅRET 2026 / 27</p><h1>Min undervisningskalender</h1><p>Planlægning, ferier og matematik samlet ét sted.</p></div>
      <div className="hero-tools">
        {view === "day" ? <div className="all-classes-badge">Begge klasser</div> : <div className="class-switch" aria-label="Vælg klasse">
          {(["5. klasse", "7. klasse"] as ClassName[]).map((name) => <button key={name} onClick={() => setGrade(name)} className={grade === name ? "active" : ""}>{name}</button>)}
        </div>}
        <div className="account-tools">
          {session ? <><span>Redigering er aktiv</span><button onClick={() => supabase.auth.signOut()}>Log ud</button></> : <button className="login-button" onClick={() => setAuthOpen((open) => !open)}>Redigér kalenderen</button>}
        </div>
      </div>
    </header>

    {authOpen && !session && <form className="auth-panel" onSubmit={sendLoginLink}>
      <div><b>Log ind som redaktør</b><p>Skriv den mailadresse, der må redigere planen. Supabase sender et sikkert login-link.</p></div>
      <label>Mailadresse<input type="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="navn@eksempel.dk" /></label>
      <button>Send login-link</button>
      {authMessage && <p className="auth-message">{authMessage}</p>}
    </form>}
    {syncError && <p className="sync-error">{syncError}</p>}

    <section className="toolbar" aria-label="Kalenderstyring">
      <div className="view-switch"><button onClick={() => setView("month")} className={view === "month" ? "selected" : ""}>Måned</button><button onClick={() => setView("week")} className={view === "week" ? "selected" : ""}>Uge</button><button onClick={() => setView("day")} className={view === "day" ? "selected" : ""}>Dag</button></div>
      <div className="navigator"><button aria-label="Forrige" onClick={previous}>‹</button><strong>{navigatorLabel}</strong><button aria-label="Næste" onClick={next}>›</button></div>
      <button className="today" onClick={() => setCursor(new Date(2026, 7, 24))}>{view === "day" ? "I dag" : "Til denne uge"}</button>
    </section>

    {view === "month" ? <section className="calendar-card">
      <div className="weekday-row">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
      <div className="month-grid">{monthDays.map((day) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day); const outside = day.getMonth() !== cursor.getMonth();
        return <button key={iso(day)} className={`day ${outside ? "outside" : ""} ${holiday ? "holiday" : ""} ${event ? "planned" : ""} ${event && isSuccessorDate(event.date) ? "successor" : ""}`} onClick={() => { setCursor(day); setView("day"); }}>
          <span className="day-number">{day.getDate()}</span>{holiday && <span className="holiday-label">{holiday}</span>}{event && <span className="event-pill">{isSuccessorDate(event.date) ? "EFTERFØLGER" : "M"} · {event.minutes} min</span>}
        </button>;
      })}</div>
    </section> : view === "week" ? <section className="week-card">
      {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day, dayIndex) => {
        const event = eventsByDate.get(iso(day)); const holiday = inHoliday(day);
        return <article key={iso(day)} className={`week-day ${event ? "has-event" : ""}`}>
          <div className="week-date"><span>{WEEKDAYS[dayIndex]}</span><strong>{day.getDate()}</strong><small>{MONTHS[day.getMonth()].toLowerCase()}</small></div>
          {holiday ? <p className="holiday-text">{holiday}</p> : event ? renderEvent(event, grade) : <p className="no-event">Ingen fast matematiktime</p>}
        </article>;
      })}
    </section> : <section className="day-card">
      <header className="day-heading"><p className="eyebrow">DAGENS UNDERVISNING</p><h2>{formatDate(cursor)} <span>{cursor.getFullYear()}</span></h2>{inHoliday(cursor) && <p className="holiday-text">{inHoliday(cursor)}</p>}</header>
      <div className="day-class-grid">
        {(["5. klasse", "7. klasse"] as ClassName[]).map((className) => {
          const event = className === "5. klasse" ? events5ByDate.get(iso(cursor)) : events7ByDate.get(iso(cursor));
          return <article className="day-class" key={className}>
            <h3 className="day-class-title">{className}</h3>
            {inHoliday(cursor) ? <p className="no-event">Ingen undervisning på grund af skoleferie.</p> : event ? renderEvent(event, className) : <p className="no-event">Ingen fast matematiktime denne dag.</p>}
          </article>;
        })}
      </div>
    </section>}

    <section className="legend"><span><i className="dot maths" /> {view === "day" ? "Begge klasser" : `Matematik – ${grade}`}</span><span><i className="dot holiday-dot" /> Skoleferie</span><span><i className="dot successor-dot" /> Efterfølgerens plan fra 1. april 2027</span><span>{view === "day" ? "Dagsvisningen samler 5. og 7. klasse på den valgte dato." : grade === "5. klasse" ? "Fast skema: mandag 45 min. · tirsdag 90 min. · torsdag 90 min." : "Fast skema: mandag 9.00–9.45 · tirsdag 9.00–9.45 · torsdag 10.50–11.35 · fredag 8.30–9.45. Fredag er øveblok og tæller ikke som en af kapitlets 12 lektioner."}</span></section>
  </main>;
}
