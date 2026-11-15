/**
 * FocusTube Datenbasis & Anti-Clickbait-Transformationen
 * Vorkategorisierte Kanäle und echte Videos aus dem Feed von @henningp.8303.
 */

export const LEARNING_GOALS = [
  {
    id: 'Finanzen & Makro',
    label: 'Finanzen & Makroökonomie',
    description: 'Märkte, Geldpolitik, Unternehmensbewertung und Wirtschaftssysteme'
  },
  {
    id: 'Immobilien & Steuern',
    label: 'Immobilien & Steuerstrategie',
    description: 'Finanzierung, Vermögensaufbau, Steueroptimierung und Investment-Praxis'
  },
  {
    id: 'Geopolitik & Spieltheorie',
    label: 'Geopolitik & Spieltheorie',
    description: 'Internationale Konflikte, Machtdynamiken und strategische Analysen'
  },
  {
    id: 'Geopolitik & Gesellschaft',
    label: 'Gesellschaft & Geschichte',
    description: 'Tiefgehende Recherchen zu Gesellschaft, Technologie und Zeitgeschichte'
  },
  {
    id: 'Wirtschaftsgeschichte',
    label: 'Wirtschaftsgeschichte',
    description: 'Historische Finanzdynastien, Industrieaufbau und Krisenmechanismen'
  },
  {
    id: 'Neurowissenschaft & Fokus',
    label: 'Neurowissenschaft & Fokus',
    description: 'Dopamin-Regulation, Lernpsychologie und kognitive Leistungsfähigkeit'
  },
  {
    id: 'Gesundheit & Biologie',
    label: 'Gesundheit & Biologie',
    description: 'Physiologie, Faszien, Hydration und präventive Gesundheit'
  },
  {
    id: 'Trading & Märkte',
    label: 'Trading & Krypto-Märkte',
    description: 'Marktzyklen, Risikomanagement und Kryptowährungen'
  }
];

export const INITIAL_CHANNELS = [
  // --- LERNEN & WISSEN ---
  {
    handle: '@PBoyle',
    name: 'Patrick Boyle',
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityBase: 95,
    description: 'Finanzprofessor & Ex-Hedgefonds-Manager: tiefgehende Markt- & Unternehmensanalysen'
  },
  {
    handle: '@HistoryXFinance',
    name: 'History Meets Finance',
    category: 'learning',
    topic: 'Wirtschaftsgeschichte',
    qualityBase: 92,
    description: 'Wirtschaftsgeschichte, industrielle Aufstiege und historische Finanzkrisen'
  },
  {
    handle: '@immocation',
    name: 'immocation',
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityBase: 86,
    description: 'Praxiswissen zu Immobilieninvestments, Finanzierung und Steuern'
  },
  {
    handle: '@CasuallyFinance',
    name: 'Casual Finance',
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityBase: 88,
    description: 'Makroökonomische Zusammenhänge und Kapitalmärkte kompakt erklärt'
  },
  {
    handle: '@tjpowertalks',
    name: 'Tj Power',
    category: 'learning',
    topic: 'Neurowissenschaft & Fokus',
    qualityBase: 93,
    description: 'Neurowissenschaftler zu Dopamin, Lernstrategien und mentaler Klarheit'
  },
  {
    handle: '@maxfisher',
    name: 'Max Fisher',
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityBase: 94,
    description: 'Journalistische Tiefenanalysen zu Politik, Anthropologie und Globalisierung'
  },
  {
    handle: '@johnnyharris',
    name: 'Johnny Harris',
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityBase: 91,
    description: 'Visuell aufbereitete geopolitische und historische Dokumentationen'
  },
  {
    handle: '@dominiksdesk',
    name: 'Dominik',
    category: 'learning',
    topic: 'Geopolitik & Spieltheorie',
    qualityBase: 90,
    description: 'Analysen zu Technologie, US-Politik und spieltheoretischen Konflikten'
  },
  {
    handle: '@oscar_patel',
    name: 'Oscar Patel',
    category: 'learning',
    topic: 'Gesundheit & Biologie',
    qualityBase: 84,
    description: 'Biologie, Faszienarbeit, Atmung und ganzheitliche Physiologie'
  },
  {
    handle: '@FlorianHommOfficial',
    name: 'Florian Homm',
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityBase: 80,
    description: 'Finanzmarkt-Kommentare, Kapitalallokation und Makro-Debatten'
  },
  {
    handle: '@GrenzgaengerStudios',
    name: 'Grenzgänger Studios',
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityBase: 88,
    description: 'Langformat-Dokus zu Pressefreiheit und gesellschaftlichen Grundsatzfragen'
  },
  {
    handle: '@fxalexg__',
    name: 'fxalexg',
    category: 'learning',
    topic: 'Trading & Märkte',
    qualityBase: 74,
    description: 'Prop-Trading-Praxis, Marktstruktur und Risikomanagement'
  },
  {
    handle: '@MMCryptoDE',
    name: 'MMCrypto DE',
    category: 'learning',
    topic: 'Trading & Märkte',
    qualityBase: 70,
    description: 'Deutschsprachige Krypto- und Bitcoin-Marktupdates'
  },

  // --- UNTERHALTUNG (MIT TAGESBUDGET) ---
  {
    handle: '@MidwestSafety',
    name: 'Midwest Safety',
    category: 'entertainment',
    topic: 'Bodycam & Action',
    qualityBase: 55,
    description: 'Polizei-Bodycam-Dokumentationen (flutet oft den Feed)'
  },
  {
    handle: '@schaefchen',
    name: 'OG Schaefchen',
    category: 'entertainment',
    topic: 'Autos & Motorsport',
    qualityBase: 62,
    description: 'Supersportwagen, Nürburgring und Umbauprojekte'
  },
  {
    handle: '@FreerunningSchlappen',
    name: 'Freerunning Schlappen',
    category: 'entertainment',
    topic: 'Parkour & Outdoor',
    qualityBase: 64,
    description: 'Parkour-Sessions, Challenges und Reise-Vlogs'
  },
  {
    handle: '@SalimSamatou1',
    name: 'Salim Samatou',
    category: 'entertainment',
    topic: 'Podcast & Talk',
    qualityBase: 72,
    description: 'Lange Talk-Runden zu Politik, Wirtschaft und Popkultur'
  },
  {
    handle: '@TommyGMcGee',
    name: 'Tommy G',
    category: 'entertainment',
    topic: 'Reportage & Street',
    qualityBase: 68,
    description: 'Street-Reportagen und ungewöhnliche Milieu-Einblicke'
  },
  {
    handle: '@FredBeyer',
    name: 'Fred Beyer',
    category: 'entertainment',
    topic: 'Vlog & Comedy',
    qualityBase: 58,
    description: 'Abenteuer-Vlogs und Entertainment'
  },
  {
    handle: '@XanderBudnick',
    name: 'Xander Budnick',
    category: 'entertainment',
    topic: 'Expedition & Natur',
    qualityBase: 78,
    description: 'Extreme Wildnis-Expeditionen und Bergsteigen'
  },
  {
    handle: '@maximbudnick',
    name: 'Maxim Budnick',
    category: 'entertainment',
    topic: 'Expedition & Natur',
    qualityBase: 78,
    description: 'Langformat-Naturabenteuer in Arktis und Wildnis'
  },
  {
    handle: '@MrSteeleFPV',
    name: 'Mr Steele',
    category: 'entertainment',
    topic: 'FPV & Drohnen',
    qualityBase: 70,
    description: 'FPV-Drohnenflüge und technische Insights hinter die Kulissen'
  },
  {
    handle: '@SeaFueFishing',
    name: 'SeaFue',
    category: 'entertainment',
    topic: 'Outdoor & Angeln',
    qualityBase: 65,
    description: 'Ruhige Angel- und Naturausflüge'
  },
  {
    handle: '@LuckyL.030',
    name: 'Lucky L 030',
    category: 'entertainment',
    topic: 'Vlog & Lifestyle',
    qualityBase: 56,
    description: 'Lifestyle- und Business-Vlogs'
  }
];

export const BLOCKED_SHORTS_SAMPLE = [
  {
    id: 'kf7T_2pTwu4',
    title: 'Your Eye Bags Aren’t From A Lack Of Sleep',
    views: '16.143 Aufrufe',
    reason: 'YouTube Short (< 60s) – automatischer Dopamin-Blocker'
  },
  {
    id: 'NSqhOppd8jY',
    title: 'Das war knapp...',
    views: '36.448 Aufrufe',
    reason: 'YouTube Short (< 60s) – Clickbait ohne Lerneffekt'
  },
  {
    id: 'yYyvQIM9fH8',
    title: 'Deine DNA entscheidet, was du essen solltest',
    views: '21.114 Aufrufe',
    reason: 'YouTube Short (< 60s) – aus Fokus-Feed entfernt'
  },
  {
    id: 'RI0OkqrqB-w',
    title: "Iz reminding me about the number one rule in life: don't swim with hippos",
    views: '22.944 Aufrufe',
    reason: 'YouTube Short (< 60s) – Unterhaltungs-Clip blockiert'
  },
  {
    id: '4bcNjV4w18A',
    title: 'How To Do Fasciapulling',
    views: '19.316 Aufrufe',
    reason: 'YouTube Short (< 60s) – besser als Langformat-Guide ansehen'
  }
];

export const INITIAL_VIDEOS = [
  {
    id: 'Ic1Jf7VlXRM',
    originalTitle: 'Anthropic Opened Its Books. What Is It Really Worth?',
    calmTitle: 'Finanzanalyse von Anthropic: Umsatz, Burn-Rate und reale Bewertung',
    channelHandle: '@PBoyle',
    channelName: 'Patrick Boyle',
    durationSec: 2349,
    durationText: '39:09',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 36,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 98,
    whyRecommended: 'Tiefgehende Bilanz- und Bewertungsanalyse ohne Hype – ideal für finanzielle Urteilskraft.',
    chapters: [
      { timeSec: 0, label: 'Einleitung & Bewertungskontext im KI-Sektor' },
      { timeSec: 420, label: 'Umsatzstruktur und Compute-Kosten im Detail' },
      { timeSec: 1140, label: 'Vergleich mit klassischen SaaS-Multiples' },
      { timeSec: 1860, label: 'Risiken, Wettbewerb und Fazit' }
    ]
  },
  {
    id: 'wUbbcOIKzDA',
    originalTitle: 'Neuroscientist Explains: How To Escape A Dopamine Hole',
    calmTitle: 'Neurowissenschaftliche Strategien zur Dopamin-Regulation im Alltag',
    channelHandle: '@tjpowertalks',
    channelName: 'Tj Power',
    durationSec: 773,
    durationText: '12:53',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 40,
    category: 'learning',
    topic: 'Neurowissenschaft & Fokus',
    qualityScore: 97,
    whyRecommended: 'Direkt anwendbare Methodik gegen Überstimulation und Dopamin-Erschöpfung.',
    chapters: [
      { timeSec: 0, label: 'Wie schnelle Reize die Dopamin-Baseline senken' },
      { timeSec: 210, label: 'Erkennen von passiven Konsum-Schleifen' },
      { timeSec: 480, label: 'Praktisches Protokoll für nachhaltigen Fokus' }
    ]
  },
  {
    id: 'vIeaOPn81XQ',
    originalTitle: 'Neuroscientist Explains: Learn Anything DISGUSTINGLY Fast',
    calmTitle: 'Neurowissenschaftliche Methoden für schnelleres und tieferes Lernen',
    channelHandle: '@tjpowertalks',
    channelName: 'Tj Power',
    durationSec: 978,
    durationText: '16:18',
    publishedText: 'vor 12 Tagen',
    publishedOrder: 34,
    category: 'learning',
    topic: 'Neurowissenschaft & Fokus',
    qualityScore: 96,
    whyRecommended: 'Vermittelt evidenzbasierte Lerntechniken für aktiven Skill-Aufbau.',
    chapters: [
      { timeSec: 0, label: 'Neuroplastizität und Aufmerksamkeitssteuerung' },
      { timeSec: 310, label: 'Aktives Abrufen statt passivem Konsum' },
      { timeSec: 690, label: 'Schlaf, Pausen und Gedächtniskonsolidierung' }
    ]
  },
  {
    id: 'selzVbmvLBM',
    originalTitle: 'How This Swedish Family Turned $5 into a $200B Empire',
    calmTitle: 'Wirtschaftsgeschichte der Familie Wallenberg: Von 5 Dollar zum Industriekonzern',
    channelHandle: '@HistoryXFinance',
    channelName: 'History Meets Finance',
    durationSec: 1253,
    durationText: '20:53',
    publishedText: 'vor 20 Std.',
    publishedOrder: 5,
    category: 'learning',
    topic: 'Wirtschaftsgeschichte',
    qualityScore: 95,
    whyRecommended: 'Strukturierte Fallstudie zu langfristigem Unternehmertum über Generationen.',
    chapters: [
      { timeSec: 0, label: 'Gründung und frühe Bankenstrategie in Schweden' },
      { timeSec: 380, label: 'Industrielle Beteiligungen und Krisenmanagement' },
      { timeSec: 890, label: 'Governance-Modell und langfristige Kapitalallokation' }
    ]
  },
  {
    id: '20CgG5pUv9Q',
    originalTitle: 'Why Egypt Guards This River With an Army',
    calmTitle: 'Geopolitik des Nils: Wasserressourcen, Staudämme und regionale Sicherheit',
    channelHandle: '@johnnyharris',
    channelName: 'Johnny Harris',
    durationSec: 2487,
    durationText: '41:27',
    publishedText: 'vor 7 Tagen',
    publishedOrder: 26,
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityScore: 94,
    whyRecommended: 'Kartenbasierte Doku über einen der zentralen Ressourcenkonflikte Afrikas.',
    chapters: [
      { timeSec: 0, label: 'Historische Abhängigkeit Ägyptens vom Nil' },
      { timeSec: 620, label: 'Der Grand-Ethiopian-Renaissance-Staudamm' },
      { timeSec: 1450, label: 'Diplomatische Verhandlungen und strategische Risiken' }
    ]
  },
  {
    id: 'yU8JpuK5NZs',
    originalTitle: 'The Binance Hack Isn’t Funny!',
    calmTitle: 'Hintergründe zu Krypto-Börsen-Hacks, Liquidität und Marktintegrität',
    channelHandle: '@PBoyle',
    channelName: 'Patrick Boyle',
    durationSec: 2437,
    durationText: '40:37',
    publishedText: 'vor 9 Tagen',
    publishedOrder: 32,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 94,
    whyRecommended: 'Sachliche Aufarbeitung von Sicherheitslücken und Systemrisiken an Krypto-Märkten.',
    chapters: [
      { timeSec: 0, label: 'Ablauf des Sicherheitsvorfalls' },
      { timeSec: 700, label: 'Marktreaktionen und Liquiditätsengpässe' },
      { timeSec: 1650, label: 'Regulatorische Konsequenzen' }
    ]
  },
  {
    id: 'wDU27f84hAs',
    originalTitle: 'Humans’ origin story is being radically revised',
    calmTitle: 'Neue archäologische Erkenntnisse zur frühen Menschheitsgeschichte',
    channelHandle: '@maxfisher',
    channelName: 'Max Fisher',
    durationSec: 2991,
    durationText: '49:51',
    publishedText: 'vor 8 Tagen',
    publishedOrder: 30,
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityScore: 95,
    whyRecommended: 'Hochwertiges Langformat mit klarer wissenschaftlicher Quellenbasis.',
    chapters: [
      { timeSec: 0, label: 'Klassisches Modell der menschlichen Ausbreitung' },
      { timeSec: 940, label: 'Neue Funde und genetische Datierung' },
      { timeSec: 2050, label: 'Bedeutung für unser Bild früher Gesellschaften' }
    ]
  },
  {
    id: 'dOHqXKxA8UU',
    originalTitle: 'America is a different country now',
    calmTitle: 'Struktureller Wandel in Politik und Gesellschaft der USA',
    channelHandle: '@maxfisher',
    channelName: 'Max Fisher',
    durationSec: 2139,
    durationText: '35:39',
    publishedText: 'vor 1 Tag',
    publishedOrder: 11,
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityScore: 93,
    whyRecommended: 'Ruhige, datenorientierte Analyse langfristiger gesellschaftlicher Trends.',
    chapters: [
      { timeSec: 0, label: 'Institutionelle Verschiebungen der letzten Dekade' },
      { timeSec: 720, label: 'Wirtschaftliche und regionale Faktoren' },
      { timeSec: 1520, label: 'Ausblick auf globale Bündnisse' }
    ]
  },
  {
    id: 'P1PF8AN0SFs',
    originalTitle: 'Eskalation im Iran-Krieg: Was die Spieltheorie vorhersagt',
    calmTitle: 'Spieltheoretische Analyse der Eskalationsdynamik im Nahen Osten',
    channelHandle: '@dominiksdesk',
    channelName: 'Dominik',
    durationSec: 2999,
    durationText: '49:59',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 38,
    category: 'learning',
    topic: 'Geopolitik & Spieltheorie',
    qualityScore: 92,
    whyRecommended: 'Nutzt formale Spieltheorie statt emotionaler Tageskommentare.',
    chapters: [
      { timeSec: 0, label: 'Akteure, Anreize und Payoff-Matrizen' },
      { timeSec: 880, label: 'Abschreckung vs. Eskalationsleiter' },
      { timeSec: 2100, label: 'Mögliche Gleichgewichte und Szenarien' }
    ]
  },
  {
    id: 'UkxAjFjzdI0',
    originalTitle: 'Warum Peter Thiel und Silicon Valley bei der Menschheit zögern',
    calmTitle: 'Technologische Beschleunigung und philosophische Positionen im Silicon Valley',
    channelHandle: '@dominiksdesk',
    channelName: 'Dominik',
    durationSec: 1808,
    durationText: '30:08',
    publishedText: 'vor 2 Tagen',
    publishedOrder: 12,
    category: 'learning',
    topic: 'Geopolitik & Spieltheorie',
    qualityScore: 90,
    whyRecommended: 'Beleuchtet Ideengeschichte und Machtfragen moderner Tech-Eliten.',
    chapters: [
      { timeSec: 0, label: 'Stagnationsthese vs. KI-Fortschritt' },
      { timeSec: 650, label: 'Politische und ethische Implikationen' },
      { timeSec: 1320, label: 'Einordnung für Europa' }
    ]
  },
  {
    id: '0VkLuC-jnAc',
    originalTitle: 'Das Eigenkapital ist alle. 6 Wege, wie ihr trotzdem die nächste Immobilie kauft',
    calmTitle: '6 Finanzierungsstrategien für Immobilien bei begrenztem Eigenkapital',
    channelHandle: '@immocation',
    channelName: 'immocation',
    durationSec: 834,
    durationText: '13:54',
    publishedText: 'vor 1 Std.',
    publishedOrder: 1,
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityScore: 89,
    whyRecommended: 'Konkrete Handlungsoptionen für Finanzierungsengpässe und Strukturierung.',
    chapters: [
      { timeSec: 0, label: 'Ausgangslage: Wenn liquides Eigenkapital fehlt' },
      { timeSec: 180, label: 'Wege 1–3: Nachbeleihung, Verkäuferdarlehen, Partner' },
      { timeSec: 510, label: 'Wege 4–6: Wertsteigerung, Ersatzsicherheiten, Timing' }
    ]
  },
  {
    id: 'fJrjIy6uu94',
    originalTitle: 'Steuerberater erklärt: Warum Vermögende kaum Steuern zahlen – und Angestellte 42 %',
    calmTitle: 'Steuerrechtliche Unterschiede zwischen Einkommensteuer und Vermögensstrukturierung',
    channelHandle: '@immocation',
    channelName: 'immocation',
    durationSec: 554,
    durationText: '9:14',
    publishedText: 'vor 3 Wochen',
    publishedOrder: 41,
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityScore: 88,
    whyRecommended: 'Kompakte Übersicht zu gesetzlichen Abschreibungs- und Strukturregeln.',
    chapters: [
      { timeSec: 0, label: 'Lohnsteuer vs. Einkünfte aus Kapital und Vermietung' },
      { timeSec: 210, label: 'Rolle von Abschreibungen und Holding-Strukturen' },
      { timeSec: 420, label: 'Was Angestellte legal davon nutzen können' }
    ]
  },
  {
    id: 'KP4vGedOuvs',
    originalTitle: 'Ohne eigenes Geld: So holst du Investoren in dein Immobilienprojekt',
    calmTitle: 'Strukturierung von Joint Ventures und privatem Kapital in Immobilienprojekten',
    channelHandle: '@immocation',
    channelName: 'immocation',
    durationSec: 3707,
    durationText: '1:01:47',
    publishedText: 'vor 5 Tagen',
    publishedOrder: 19,
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityScore: 87,
    whyRecommended: 'Ausführlicher Praxis-Deep-Dive zu Investorengesprächen und Verträgen.',
    chapters: [
      { timeSec: 0, label: 'Deal-Sourcing als Grundlage für Investoren' },
      { timeSec: 1200, label: 'Rechtliche Aufteilung und Haftungsfragen' },
      { timeSec: 2600, label: 'Kalkulationsbeispiel und Exit-Szenarien' }
    ]
  },
  {
    id: 'Wl5em6H0T0M',
    originalTitle: 'Ingenieur kauft 22 Wohnungen, bevor er kündigt',
    calmTitle: 'Fallstudie: Nebenberuflicher Aufbau eines Wohnungsportfolios (22 Einheiten)',
    channelHandle: '@immocation',
    channelName: 'immocation',
    durationSec: 3178,
    durationText: '52:58',
    publishedText: 'vor 10 Tagen',
    publishedOrder: 33,
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityScore: 85,
    whyRecommended: 'Konkrete Zahlen zu Cashflow, Finanzierung und Zeitmanagement.',
    chapters: [
      { timeSec: 0, label: 'Die ersten drei Objekte neben dem Vollzeitjob' },
      { timeSec: 1400, label: 'Skalierung über Mehrfamilienhäuser' },
      { timeSec: 2450, label: 'Übergang in die finanzielle Unabhängigkeit' }
    ]
  },
  {
    id: '74Zw19WXJv8',
    originalTitle: '18 Millionen Schulden, 40 Jahre alt: So sieht unsere finanzielle Freiheit aus',
    calmTitle: 'Fremdkapitalhebel und Cashflow-Management bei großen Immobilienportfolios',
    channelHandle: '@immocation',
    channelName: 'immocation',
    durationSec: 2736,
    durationText: '45:36',
    publishedText: 'vor 7 Tagen',
    publishedOrder: 9,
    category: 'learning',
    topic: 'Immobilien & Steuern',
    qualityScore: 84,
    whyRecommended: 'Einblick in Zinsrisiko, Tilgungsplanung und Bestandsverwaltung.',
    chapters: [
      { timeSec: 0, label: 'Portfolio-Aufbau und Verschuldungsgrad' },
      { timeSec: 1100, label: 'Umgang mit Zinsänderungen' }
    ]
  },
  {
    id: 'YUyoWFlaOKg',
    originalTitle: 'The Smart People Have Started Looking for the Exit',
    calmTitle: 'Institutionelle Kapitalströme und Marktbewertungen im aktuellen Zyklus',
    channelHandle: '@CasuallyFinance',
    channelName: 'Casual Finance',
    durationSec: 1029,
    durationText: '17:09',
    publishedText: 'vor 5 Tagen',
    publishedOrder: 7,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 87,
    whyRecommended: 'Analysiert Insider-Verkäufe, Liquiditätsindikatoren und Risikoaufschläge.',
    chapters: [
      { timeSec: 0, label: 'Signale aus dem institutionellen Sektor' },
      { timeSec: 450, label: 'Bewertungskennzahlen im historischen Vergleich' }
    ]
  },
  {
    id: 'dWdhu3_OI2A',
    originalTitle: "Nobody Wants To Admit the Real Estate Crisis That's Already Here",
    calmTitle: 'Gewerbeimmobilien und Refinanzierungsrisiken in den USA und Europa',
    channelHandle: '@CasuallyFinance',
    channelName: 'Casual Finance',
    durationSec: 937,
    durationText: '15:37',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 35,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 86,
    whyRecommended: 'Relevant für das Zusammenspiel aus Bankbilanzen und Immobilienpreisen.',
    chapters: [
      { timeSec: 0, label: 'Leerstand bei Büroimmobilien' },
      { timeSec: 420, label: 'Auswirkungen auf Regionalbanken' }
    ]
  },
  {
    id: 'NyOeLB0WVNE',
    originalTitle: 'Elon Musk’s Power Plant on Wheels',
    calmTitle: 'Energie-Infrastruktur, Batteriespeicher und Geschäftsmodelle hinter Elektroflotten',
    channelHandle: '@PBoyle',
    channelName: 'Patrick Boyle',
    durationSec: 1861,
    durationText: '31:01',
    publishedText: 'vor 3 Wochen',
    publishedOrder: 42,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 93,
    whyRecommended: 'Wirtschaftliche Einordnung von Stromnetzen, Speicherkapazität und Bewertung.',
    chapters: [
      { timeSec: 0, label: 'Energiebedarf von Rechenzentren und Netzen' },
      { timeSec: 840, label: 'Wirtschaftlichkeit mobiler und stationärer Speicher' }
    ]
  },
  {
    id: 'dYZtNteIvdY',
    originalTitle: 'Henry Ford Put America on Wheels (And Hitler Noticed)',
    calmTitle: 'Industriegeschichte: Fords Fließbandproduktion und internationale Verflechtungen',
    channelHandle: '@HistoryXFinance',
    channelName: 'History Meets Finance',
    durationSec: 1603,
    durationText: '26:43',
    publishedText: 'vor 8 Tagen',
    publishedOrder: 29,
    category: 'learning',
    topic: 'Wirtschaftsgeschichte',
    qualityScore: 91,
    whyRecommended: 'Historische Analyse zu Massenproduktion, Effizienz und Geopolitik.',
    chapters: [
      { timeSec: 0, label: 'Aufstieg der Ford Motor Company' },
      { timeSec: 780, label: 'Globale industrielle Exportstrategien der 1930er' }
    ]
  },
  {
    id: 'yXzgiMFlxg0',
    originalTitle: 'The Rothschild Loan That Handed Britain Egypt',
    calmTitle: 'Finanzgeschichte: Die Suezkanal-Finanzierung und koloniale Staatsanleihen',
    channelHandle: '@HistoryXFinance',
    channelName: 'History Meets Finance',
    durationSec: 1513,
    durationText: '25:13',
    publishedText: 'vor 3 Wochen',
    publishedOrder: 43,
    category: 'learning',
    topic: 'Wirtschaftsgeschichte',
    qualityScore: 92,
    whyRecommended: 'Zeigt präzise, wie Staatsverschuldung geopolitische Kontrolle verändert hat.',
    chapters: [
      { timeSec: 0, label: 'Finanzierung des Suezkanals' },
      { timeSec: 690, label: 'Staatsanleihen und Machtverschiebung 1875' }
    ]
  },
  {
    id: 'SxJ7GIkvuXU',
    originalTitle: 'Julian Assange & die Grenzen der Pressefreiheit | 45 Minuten gegen das Vergessen | KEIN KOMMENTAR',
    calmTitle: 'Dokumentation: Julian Assange, WikiLeaks und Grenzen der Pressefreiheit',
    channelHandle: '@GrenzgaengerStudios',
    channelName: 'Grenzgänger Studios',
    durationSec: 3000,
    durationText: '50:00',
    publishedText: 'vor 2 Tagen',
    publishedOrder: 13,
    category: 'learning',
    topic: 'Geopolitik & Gesellschaft',
    qualityScore: 89,
    whyRecommended: 'Strukturierte Langzeit-Dokumentation zu Rechtsstaatlichkeit und Medien.',
    chapters: [
      { timeSec: 0, label: 'Chronologie der Veröffentlichungen' },
      { timeSec: 1450, label: 'Juristische Verfahren und internationale Reaktionen' }
    ]
  },
  {
    id: 'KhzbUgCI6Aw',
    originalTitle: 'Neuroscientist Explains: WORST Habits In Your 20s',
    calmTitle: 'Kognitive Gewohnheiten und langfristige Gehirngesundheit im jungen Erwachsenenalter',
    channelHandle: '@tjpowertalks',
    channelName: 'Tj Power',
    durationSec: 1557,
    durationText: '25:57',
    publishedText: 'vor 5 Tagen',
    publishedOrder: 20,
    category: 'learning',
    topic: 'Neurowissenschaft & Fokus',
    qualityScore: 91,
    whyRecommended: 'Praxisnahe Impulse für Routinen, Schlaf und mentale Energie.',
    chapters: [
      { timeSec: 0, label: 'Reizüberflutung und Konzentrationsverlust' },
      { timeSec: 680, label: 'Alltagsgewohnheiten mit Hebelwirkung' }
    ]
  },
  {
    id: 'DuXxgl_LxYM',
    originalTitle: 'How Negative Emotions Tighten The Fascia | Full Guide',
    calmTitle: 'Zusammenhang zwischen Stressreaktionen, Nervensystem und Faszienstruktur',
    channelHandle: '@oscar_patel',
    channelName: 'Oscar Patel',
    durationSec: 2160,
    durationText: '36:00',
    publishedText: 'vor 8 Tagen',
    publishedOrder: 27,
    category: 'learning',
    topic: 'Gesundheit & Biologie',
    qualityScore: 85,
    whyRecommended: 'Ausführlicher Leitfaden zu Körperhaltung, Stressabbau und Mobilität.',
    chapters: [
      { timeSec: 0, label: 'Physiologie des Bindegewebes' },
      { timeSec: 920, label: 'Praktische Übungen zur Entspannung' }
    ]
  },
  {
    id: 'mS3i_IpzzXc',
    originalTitle: "We Aren't Aging, We Are Dehydrating | Unfiltered Video",
    calmTitle: 'Zelluläre Hydration, Elektrolyte und Hautgesundheit im Überblick',
    channelHandle: '@oscar_patel',
    channelName: 'Oscar Patel',
    durationSec: 1258,
    durationText: '20:58',
    publishedText: 'vor 3 Tagen',
    publishedOrder: 17,
    category: 'learning',
    topic: 'Gesundheit & Biologie',
    qualityScore: 82,
    whyRecommended: 'Kompakter Beitrag zu Wasserhaushalt und Mineralstoff-Aufnahme.',
    chapters: [
      { timeSec: 0, label: 'Unterschied zwischen Wasseraufnahme und zellulärer Hydration' },
      { timeSec: 540, label: 'Ernährung und Mineralstoffe' }
    ]
  },
  {
    id: '0Bbcyi8wtJs',
    originalTitle: "Botox Isn't The Answer, Releasing The Fascia Is",
    calmTitle: 'Gesichtsmuskulatur, Faszienentspannung und natürliche Durchblutung',
    channelHandle: '@oscar_patel',
    channelName: 'Oscar Patel',
    durationSec: 875,
    durationText: '14:35',
    publishedText: 'vor 6 Tagen',
    publishedOrder: 23,
    category: 'learning',
    topic: 'Gesundheit & Biologie',
    qualityScore: 80,
    whyRecommended: 'Praxis-Übungen zur Lösung von Muskelverspannungen im Kiefer- und Stirnbereich.',
    chapters: [
      { timeSec: 0, label: 'Anatomie der Gesichtsmuskulatur' },
      { timeSec: 410, label: 'Massagetechniken und Atmung' }
    ]
  },
  {
    id: '7T8xwozhnmQ',
    originalTitle: '⚠️⚠️⚠️ Wir haben das Geld – und setzen es falsch ein! – Erfolgsformel Deutschland!',
    calmTitle: 'Analyse zu Staatshaushalt, Investitionsquote und Wirtschaftspolitik in Deutschland',
    channelHandle: '@FlorianHommOfficial',
    channelName: 'Florian Homm',
    durationSec: 1319,
    durationText: '21:59',
    publishedText: 'vor 7 Tagen',
    publishedOrder: 25,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 79,
    whyRecommended: 'Standort- und Kapitalallokationsdebatte mit Fokus auf deutsche Wirtschaftspolitik.',
    chapters: [
      { timeSec: 0, label: 'Steuereinnahmen und Ausgabenstruktur' },
      { timeSec: 600, label: 'Vergleich internationaler Investitionsquoten' }
    ]
  },
  {
    id: 'o7AAMkluCiI',
    originalTitle: 'Was uns in Krisenzeiten wirklich trägt | Homm & Flavio von Witzleben',
    calmTitle: 'Gespräch über wirtschaftliche Krisenresilienz und Vermögensschutz',
    channelHandle: '@FlorianHommOfficial',
    channelName: 'Florian Homm',
    durationSec: 2719,
    durationText: '45:19',
    publishedText: 'vor 2 Std.',
    publishedOrder: 2,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 78,
    whyRecommended: 'Aktuelles Gespräch zur Einschätzung geopolitischer und finanzieller Risiken.',
    chapters: [
      { timeSec: 0, label: 'Einschätzung der aktuellen Makrolage' },
      { timeSec: 1350, label: 'Persönliche Krisenstrategien und Diversifikation' }
    ]
  },
  {
    id: 'LHqNK7ryRL8',
    originalTitle: 'Deutschland will nicht mehr? Harvard-Absolvent Homm und Bonelli blicken hinter die Fassade!',
    calmTitle: 'Diskussion zur Wettbewerbsfähigkeit und Bürokratie am Standort Deutschland',
    channelHandle: '@FlorianHommOfficial',
    channelName: 'Florian Homm',
    durationSec: 2774,
    durationText: '46:14',
    publishedText: 'vor 3 Tagen',
    publishedOrder: 16,
    category: 'learning',
    topic: 'Finanzen & Makro',
    qualityScore: 77,
    whyRecommended: 'Einordnung struktureller Herausforderungen im deutschen Mittelstand.',
    chapters: [
      { timeSec: 0, label: 'Standortfaktoren im internationalen Vergleich' },
      { timeSec: 1200, label: 'Reformansätze für Arbeitsmarkt und Energie' }
    ]
  },
  {
    id: '7HX4Dkl4TFs',
    originalTitle: 'Trump verliert den Kongress: Ab dem 3. Januar hat er ein Riesenproblem',
    calmTitle: 'Auswirkungen der US-Kongressmehrheiten auf Gesetzgebung und Haushalt',
    channelHandle: '@dominiksdesk',
    channelName: 'Dominik',
    durationSec: 1735,
    durationText: '28:55',
    publishedText: 'vor 8 Tagen',
    publishedOrder: 28,
    category: 'learning',
    topic: 'Geopolitik & Spieltheorie',
    qualityScore: 88,
    whyRecommended: 'Institutionelle Analyse der Machtbalance zwischen Weißem Haus und Kongress.',
    chapters: [
      { timeSec: 0, label: 'Wahlausgang und Sitzverteilung' },
      { timeSec: 780, label: 'Blockade-Szenarien und Fiskalpolitik' }
    ]
  },
  {
    id: 'rJcbnxIkpAs',
    originalTitle: 'I Got Funded $1M by a Regulated Firm to Prove It’s Not Luck',
    calmTitle: 'Dokumentation einer Trading-Challenge unter regulierten Risikoregeln',
    channelHandle: '@fxalexg__',
    channelName: 'fxalexg',
    durationSec: 7606,
    durationText: '2:06:46',
    publishedText: 'vor 2 Tagen',
    publishedOrder: 14,
    category: 'learning',
    topic: 'Trading & Märkte',
    qualityScore: 74,
    whyRecommended: 'Langes Praxisprotokoll zu Positionsgrößen und Drawdown-Kontrolle.',
    chapters: [
      { timeSec: 0, label: 'Regelwerk und Drawdown-Limits' },
      { timeSec: 2400, label: 'Ausführung der Trades im Markt' }
    ]
  },
  {
    id: 'oobGQ4pAwS0',
    originalTitle: 'Bitcoin.. wir müssen ehrlich sein.. [verrückte Vorhersage]',
    calmTitle: 'Aktuelle Bitcoin-Markteinschätzung und technische Preiszonen',
    channelHandle: '@MMCryptoDE',
    channelName: 'MMCrypto DE',
    durationSec: 538,
    durationText: '8:58',
    publishedText: 'vor 3 Std.',
    publishedOrder: 3,
    category: 'learning',
    topic: 'Trading & Märkte',
    qualityScore: 68,
    whyRecommended: 'Kurzes Marktupdate zu aktuellen Bitcoin-Unterstützungszonen.',
    chapters: [
      { timeSec: 0, label: 'Chartanalyse im Tageschart' },
      { timeSec: 260, label: 'Liquiditätszonen und Szenarien' }
    ]
  },

  // --- UNTERHALTUNG (BEWUSST LIMITIERT) ---
  {
    id: 'NmV22jRADaI',
    originalTitle: 'Climbing Mt Everest',
    calmTitle: 'Expeditions-Dokumentation: Besteigung des Mount Everest',
    channelHandle: '@XanderBudnick',
    channelName: 'Xander Budnick',
    durationSec: 4432,
    durationText: '1:13:52',
    publishedText: 'vor 8 Tagen',
    publishedOrder: 31,
    category: 'entertainment',
    topic: 'Expedition & Natur',
    qualityScore: 78,
    whyRecommended: 'Ruhige Natur- und Ausdauerdoku ohne schnellen Schnitt.',
    chapters: [
      { timeSec: 0, label: 'Basislager und Akklimatisierung' },
      { timeSec: 1800, label: 'Aufstieg durch den Khumbu-Eisbruch' },
      { timeSec: 3400, label: 'Gipfeletappe und Abstieg' }
    ]
  },
  {
    id: 'fKL-s0oClaQ',
    originalTitle: "17 Days in Greenland's Realm of the Gods",
    calmTitle: '17 Tage Expedition durch Grönland: Naturaufnahmen und Logistik',
    channelHandle: '@maximbudnick',
    channelName: 'Maxim Budnick',
    durationSec: 7136,
    durationText: '1:58:56',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 39,
    category: 'entertainment',
    topic: 'Expedition & Natur',
    qualityScore: 77,
    whyRecommended: 'Entschleunigte Outdoor-Expedition in der Arktis.',
    chapters: [
      { timeSec: 0, label: 'Anreise und Routenplanung' },
      { timeSec: 2800, label: 'Durchquerung der Fjordlandschaft' }
    ]
  },
  {
    id: 'zaVNIGStpzo',
    originalTitle: 'Die Wahrheit hinter dem Nvidia-Skandal…',
    calmTitle: 'Podcast-Gespräch mit Shayan Garcia zu Tech-Märkten und Geopolitik',
    channelHandle: '@SalimSamatou1',
    channelName: 'Salim Samatou',
    durationSec: 5965,
    durationText: '1:39:25',
    publishedText: 'vor 1 Tag',
    publishedOrder: 10,
    category: 'entertainment',
    topic: 'Podcast & Talk',
    qualityScore: 72,
    whyRecommended: 'Unterhaltsamer Langformat-Talk zu aktuellen Tech-Schlagzeilen.',
    chapters: [
      { timeSec: 0, label: 'Einstieg und Marktentwicklung' },
      { timeSec: 2100, label: 'Diskussion um Halbleiter-Lieferketten' }
    ]
  },
  {
    id: 'treDHMp7F8E',
    originalTitle: 'Drone Jobs as a One Man Show Can be Dangerous | RAW TRX',
    calmTitle: 'Alltag eines Solo-FPV-Drohnenpiloten bei kommerziellen Drehs',
    channelHandle: '@MrSteeleFPV',
    channelName: 'Mr Steele',
    durationSec: 2578,
    durationText: '42:58',
    publishedText: 'vor 5 Tagen',
    publishedOrder: 21,
    category: 'entertainment',
    topic: 'FPV & Drohnen',
    qualityScore: 70,
    whyRecommended: 'Technischer Einblick in FPV-Setups und Risikobewertung am Set.',
    chapters: [
      { timeSec: 0, label: 'Vorbereitung und Equipment-Check' },
      { timeSec: 1100, label: 'Flugaufnahmen und Nachbesprechung' }
    ]
  },
  {
    id: 'H9BSYGXS1XM',
    originalTitle: 'How Drugs Get Into Prison',
    calmTitle: 'Reportage über Sicherheitsabläufe und Schmuggelwege in US-Gefängnissen',
    channelHandle: '@TommyGMcGee',
    channelName: 'Tommy G',
    durationSec: 2172,
    durationText: '36:12',
    publishedText: 'vor 4 Tagen',
    publishedOrder: 18,
    category: 'entertainment',
    topic: 'Reportage & Street',
    qualityScore: 68,
    whyRecommended: 'Milieu-Reportage mit Interviews.',
    chapters: [{ timeSec: 0, label: 'Interview-Teil & Dokumentation' }]
  },
  {
    id: 'exleG_dK6MI',
    originalTitle: 'I BOUGHT THE ULTIMATE SUPER SUV! (Every Crypto Scammers Dream Car)',
    calmTitle: 'Fahrzeugvorstellung: Super-SUV im Werkstatt- und Straßentest',
    channelHandle: '@schaefchen',
    channelName: 'OG Schaefchen',
    durationSec: 1157,
    durationText: '19:17',
    publishedText: 'vor 2 Tagen',
    publishedOrder: 15,
    category: 'entertainment',
    topic: 'Autos & Motorsport',
    qualityScore: 60,
    whyRecommended: 'Reine Automobil-Unterhaltung (im Tageslimit enthalten).',
    chapters: [{ timeSec: 0, label: 'Fahrzeug-Walkaround & Fahreindrücke' }]
  },
  {
    id: 'sxMtMGzAOJ4',
    originalTitle: 'Double Flip aufs GESICHT! | Parkour Session ohne Ende in Biarritz! 🇫🇷',
    calmTitle: 'Parkour-Session in Biarritz: Trainingsaufnahmen und Spots',
    channelHandle: '@FreerunningSchlappen',
    channelName: 'Freerunning Schlappen',
    durationSec: 3070,
    durationText: '51:10',
    publishedText: 'vor 6 Tagen',
    publishedOrder: 24,
    category: 'entertainment',
    topic: 'Parkour & Outdoor',
    qualityScore: 63,
    whyRecommended: 'Unterhaltsame Parkour-Session (im Tageslimit enthalten).',
    chapters: [{ timeSec: 0, label: 'Spot-Erkundung in Biarritz' }]
  },
  {
    id: '49O63YDtQXk',
    originalTitle: '7 Cops PIT Fleeing Range Rover 15 Times',
    calmTitle: 'Polizei-Bodycam-Dokumentation: Verfolgungsjagd und Einsatzablauf',
    channelHandle: '@MidwestSafety',
    channelName: 'Midwest Safety',
    durationSec: 1016,
    durationText: '16:56',
    publishedText: 'vor 13 Std.',
    publishedOrder: 4,
    category: 'entertainment',
    topic: 'Bodycam & Action',
    qualityScore: 52,
    whyRecommended: 'Hohes Dopamin-Potenzial – in Unterhaltungs-Budget ausgelagert.',
    chapters: [{ timeSec: 0, label: 'Einsatzbeginn und Funkprotokoll' }]
  },
  {
    id: 'b5SStVtz3rc',
    originalTitle: 'Drunk Driver Plows Through 4 First Responders',
    calmTitle: 'Polizei-Bodycam-Dokumentation: Verkehrsunfall und Einsatzkräfte',
    channelHandle: '@MidwestSafety',
    channelName: 'Midwest Safety',
    durationSec: 1259,
    durationText: '20:59',
    publishedText: 'vor 1 Tag',
    publishedOrder: 6,
    category: 'entertainment',
    topic: 'Bodycam & Action',
    qualityScore: 50,
    whyRecommended: 'Action-Bodycam – wird durch Kanal-Flut-Bremse gedrosselt.',
    chapters: [{ timeSec: 0, label: 'Einsatzdokumentation' }]
  },
  {
    id: '0lVV37bZdAI',
    originalTitle: 'Masked Robber Shoots Cop 7 Times Point-Blank',
    calmTitle: 'Polizei-Bodycam-Dokumentation: Überfall und Festnahme',
    channelHandle: '@MidwestSafety',
    channelName: 'Midwest Safety',
    durationSec: 964,
    durationText: '16:04',
    publishedText: 'vor 3 Tagen',
    publishedOrder: 8,
    category: 'entertainment',
    topic: 'Bodycam & Action',
    qualityScore: 50,
    whyRecommended: 'Action-Bodycam – wird durch Kanal-Flut-Bremse gedrosselt.',
    chapters: [{ timeSec: 0, label: 'Einsatzdokumentation' }]
  },
  {
    id: 'QCUzW9019lQ',
    originalTitle: 'I Survived a Kidnapping...AGAIN!',
    calmTitle: 'Reise-Vlog von Fred Beyer: Erlebnisse und Erzählung',
    channelHandle: '@FredBeyer',
    channelName: 'Fred Beyer',
    durationSec: 2779,
    durationText: '46:19',
    publishedText: 'vor 2 Wochen',
    publishedOrder: 37,
    category: 'entertainment',
    topic: 'Vlog & Comedy',
    qualityScore: 54,
    whyRecommended: 'Reine Unterhaltung – für Pausen innerhalb des Tagesbudgets.',
    chapters: [{ timeSec: 0, label: 'Vlog-Abschnitt' }]
  },
  {
    id: 'cuESB4Vg6As',
    originalTitle: '24H mit einem Immobilien Millionär in FFM',
    calmTitle: '24-Stunden-Tagesbegleitung in Frankfurt am Main',
    channelHandle: '@LuckyL.030',
    channelName: 'Lucky L 030',
    durationSec: 1761,
    durationText: '29:21',
    publishedText: 'vor 6 Tagen',
    publishedOrder: 22,
    category: 'entertainment',
    topic: 'Vlog & Lifestyle',
    qualityScore: 55,
    whyRecommended: 'Lifestyle-Vlog (im Unterhaltungs-Limit enthalten).',
    chapters: [{ timeSec: 0, label: 'Tagesablauf in Frankfurt' }]
  }
];

/**
 * Wandelt reißerische YouTube-Titel (auch bei live geladenen API-Videos)
 * in ruhigere, sachlichere Titel ohne Emojis, ALL-CAPS oder Clickbait-Satzzeichen um.
 */
export function calmTitleTransform(rawTitle = '') {
  if (!rawTitle) return '';

  // Emojis und Sonder-Symbole entfernen
  let cleaned = rawTitle
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\[[^\]]*(verrückt|crazy|shocking|must watch|scam|exposed)[^\]]*\]/gi, '')
    .replace(/[!?]{2,}/g, '.')
    .replace(/\.\.{2,}/g, ' – ')
    .replace(/\s+/g, ' ')
    .trim();

  // Vollständige ALL-CAPS-Wörter (> 3 Buchstaben, bekannte Akronyme ausnehmen) entschärfen
  const acronyms = new Set(['USA', 'US', 'KI', 'AI', 'ETF', 'GDP', 'FED', 'EZB', 'BIP', 'FPV', 'SUV', 'FFM', 'BTC', 'CEO', 'IPO', 'API', 'GmbH']);
  cleaned = cleaned
    .split(' ')
    .map((word) => {
      const pure = word.replace(/[^a-zA-ZÄÖÜäöüß]/g, '');
      if (pure.length > 3 && pure === pure.toUpperCase() && !acronyms.has(pure)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');

  return cleaned.replace(/^[-–|:\s]+|[-–|:\s]+$/g, '').trim() || rawTitle;
}
