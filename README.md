# FocusTube — Low-Dopamine YouTube Lern-Workspace

Eine reine Client-Side-Web-App (kein Backend nötig), die YouTube von einem Dopamin-Feed in ein produktives Wissens- und Lernwerkzeug verwandelt — komplett ohne Shorts und ohne die Video-Vorschläge **im** Video-Player beim Pausieren oder am Videoende.

## Features

1. **Schutzschild-Player (0 % Vorschläge im Video):**
   - Deaktiviert YouTubes native Player-Leiste (`controls=0`, `rel=0`, `iv_load_policy=3`) und legt einen Klick-Schutzschild über das IFrame.
   - Beim Pausieren und **1,5 Sekunden vor Videoende** überdeckt ein ruhiges FocusTube-Overlay das komplette Video — YouTube-Endscreens und Pause-Empfehlungen werden niemals sichtbar.
   - Eigene Steuerleiste (Play/Pause, `±15s`, Scrubber, Geschwindigkeit `1x–2x`, Ton, Vollbild mit aktivem Schutzschild).
2. **Transparenter Wissens-Algorithmus & Lern-Modi:**
   - Umschalter zwischen **🎓 Lernen (Wissen & Skills)** und **🍿 Unterhaltung (Zeitbudget)**.
   - Vorkategorisierte Abos & echte Videos aus dem Feed von `@henningp.8303` (jederzeit im **Abo-Manager** umstellbar).
   - **Kanal-Flut-Bremse** (begrenzt Viel-Uploader wie *Midwest Safety* oder *immocation* optional auf max. 2 Videos).
   - **Ruhige Titel** & **Graustufen-Thumbnails** gegen visuelle Clickbait-Trigger.
3. **Live-Timer & Wochen-Dashboard:**
   - Läuft automatisch während der Wiedergabe (oder manuell per Klick) und speichert Lern- vs. Unterhaltungszeit pro Tag im Browser (`localStorage`).
   - Sperrt den Unterhaltungs-Feed automatisch, sobald das eingestellte Tageslimit erreicht ist.
4. **Kapitel-Inhaltsverzeichnis, Zeitstempel-Notizen & Obsidian-Export:**
   - Direktsprung zu Video-Kapiteln und Speichern eigener Erkenntnisse mit klickbarem Deep-Link-Zeitstempel (`youtu.be/ID?t=SEC`).
   - **Obsidian One-Click-Export:** Öffnet Notizen direkt über `obsidian://new` (inkl. YAML-Frontmatter & Tags) oder speichert in Chrome/Arc/Edge direkt in deinen verknüpften Vault-Ordner.
   - **Gemini KI-Lernnotiz:** Erzeugt aus Videometadaten, Kapiteln, deinen Notizen (und optional eingefügtem Transkript) dichte Kernaussagen, mentale Modelle & Active-Recall-Fragen.
5. **🔭 Wissens-Entdecker (Discovery ohne Dopamin-Algorithmus):**
   - Gemini formuliert präzise Fach-Suchanfragen, YouTube liefert reale Videos ohne Shorts und Gemini bewertet nach **Informationsdichte** (Standard: *Kompakt & dicht 6–22 Min.* statt künstlich gestreckter Langformate) — hart limitiert auf max. 5 Treffer.
   - Beliebige YouTube-Links lassen sich direkt im Schutzschild-Player öffnen.
6. **Echte YouTube-Abos & `UU`-Playlist-Trick (GitHub Pages Ready):**
   - Anmeldung per Google OAuth 2.0 direkt im Browser (`https://www.googleapis.com/auth/youtube`).
   - Lädt Live-Uploads über die versteckte `UU...`-Uploads-Playlist jedes Kanals für nur **1 Quota-Unit** pro Kanal.

---

## Auf GitHub Pages veröffentlichen

1. Erstelle auf GitHub ein neues Repository (z. B. `focustube`).
2. Lade alle Dateien aus diesem Ordner (`index.html`, `styles.css`, `app.js`, `data.js`, `README.md`) in das Repository hoch:
   ```bash
   git init
   git add .
   git commit -m "Initial FocusTube release"
   git branch -M main
   git remote add origin https://github.com/DEIN-USER/focustube.git
   git push -u origin main
   ```
3. Öffne auf GitHub **Settings → Pages** und wähle unter *Source*: **Deploy from a branch** → Branch `main` (`/ (root)`).
4. Nach ca. 1 Minute ist deine Seite unter `https://DEIN-USER.github.io/focustube/` live.

---

## Optional: Google OAuth 2.0 für Live-Sync einrichten

Die App funktioniert dank deiner vorab geladenen Abo-Daten sofort offline/statisch. Wenn du oder andere Nutzer sich live mit dem Google-Konto anmelden wollen:

1. Öffne die [Google Cloud Console](https://console.cloud.google.com/) und erstelle ein neues Projekt.
2. Aktiviere unter **APIs & Dienste → Bibliothek** die **YouTube Data API v3**.
3. Konfiguriere den **OAuth-Zustimmungsbildschirm** (Typ: *Extern*, Testnutzer: deine eigene Gmail-Adresse hinzufügen oder App veröffentlichen).
4. Erstelle unter **Anmeldedaten → Anmeldedaten erstellen → OAuth-Client-ID** eine **Webanwendung** und trage unter *Autorisierte JavaScript-Ursprünge* ein:
   - `https://DEIN-USER.github.io`
   - `http://localhost:8090` (für lokales Testen)
5. Klicke in FocusTube oben rechts auf **🔗 YouTube Sync**, füge deine Client-ID ein und melde dich an.

---

## Lokal testen

```bash
python3 -m http.server 8090
```
Danach im Browser `http://localhost:8090` öffnen.
