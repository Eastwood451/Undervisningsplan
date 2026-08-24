# KonteXt-undervisningskalender

En lokal kalenderapp til matematikundervisningen i 5. og 7. klasse. Appen
indeholder måneds- og ugevisning, skolens ferier, undervisningstider,
KonteXt+-forløb, materialer og lektier.

## Start kalenderen på Windows

Krav: Node.js 22.13 eller nyere.

```powershell
npm install
npm run dev
```

Åbn derefter den lokale adresse, som vises i terminalen. Data og appkode ligger
udelukkende i denne projektmappe; kalenderen bruger ikke ChatGPT Sites.

## Kontrol af den færdige app

```powershell
npm run build
npm run start
```

Den centrale kalenderkode findes i `app/page.tsx`, og designet findes i
`app/globals.css`.
