/* Beispieldaten des Klick-Dummys. */
window.CC_DATA = {
  host: "coding-challenges.example",
  user: { name: "Alex Beispiel", initials: "AB", email: "alex@example.org", tokenCreatedAt: "2026-10-12T09:30:00" },
  guestLink: {
    challengeId: "json-api",
    label: "Workshop Backend November",
    expires: "2026-12-06T23:59:00",
    linkLimitTotal: 100,
    linkLimitLeft: 87
  },

  challenges: [
    {
      id: "grosses-sudoku",
      title: "Großes Sudoku",
      summary: "Löse ein Sudoku mit 25 × 25 Feldern und den Zahlen 1 bis 25.",
      format: "wert", difficulty: "mittel", author: "Lena K.", version: 1, limit: 5,
      visibility: "öffentlich", state: "freigegeben", isNew: true,
      status: { kind: "offen" },
      answer: {
        type: "textarea",
        label: "Gelöstes Sudoku als CSV",
        hint: "25 Zeilen mit je 25 Zahlen, getrennt durch Komma. Leerzeichen um die Zahlen und eine leere Zeile am Ende sind erlaubt.",
        placeholder: ""
      },
      task: `
        <p>Ein klassisches Sudoku hat 9 × 9 Felder. Dieses hier ist deutlich größer: <strong>25 Zeilen, 25 Spalten und 25 Blöcke</strong>
        mit je 5 × 5 Feldern. 295 der 625 Felder sind vorgegeben, die übrigen 330 sind leer.</p>
        <p>Fülle die leeren Felder so aus, dass</p>
        <ul>
          <li>jede <strong>Zeile</strong> die Zahlen 1 bis 25 genau einmal enthält,</li>
          <li>jede <strong>Spalte</strong> die Zahlen 1 bis 25 genau einmal enthält,</li>
          <li>jeder <strong>Block</strong> (5 × 5 Felder, durch dicke Linien abgegrenzt) die Zahlen 1 bis 25 genau einmal enthält.</li>
        </ul>
        <p>Das Rätsel hat genau eine Lösung.</p>
        <h2>Rätsel</h2>
        <figure class="figure">
          <div class="figure-frame"><img src="assets/challenges/huge-sudoku.svg" width="816" height="816"
            alt="Großes Sudoku: 25 × 25 Felder mit vorgegebenen Zahlen; die Daten stehen vollständig in grosses-sudoku.json"></div>
          <figcaption>Das Bild dient nur der Übersicht. Für dein Programm nutzt du die JSON-Datei.</figcaption>
        </figure>
        <div class="downloads">
          <a class="btn btn-outline" href="assets/challenges/huge-sudoku.json" download>{{icon:download}} grosses-sudoku.json</a>
          <a class="btn btn-outline" href="assets/challenges/huge-sudoku.svg" download>{{icon:download}} grosses-sudoku.svg</a>
        </div>
        <h2>Datenformat</h2>
        <div class="code-block"><pre><code>{
  "size": 25,
  "boxSize": 5,
  "empty": 0,
  "grid": [
    [ 0,  0,  0,  4,  0, 15,  0, 22,  0, 20, …],
    … 24 weitere Zeilen …
  ]
}</code></pre></div>
        <table>
          <thead><tr><th scope="col">Feld</th><th scope="col">Bedeutung</th></tr></thead>
          <tbody>
            <tr><td><code>size</code></td><td>Anzahl der Zeilen und Spalten (25)</td></tr>
            <tr><td><code>boxSize</code></td><td>Kantenlänge eines Blocks (5)</td></tr>
            <tr><td><code>empty</code></td><td>Wert, der ein leeres Feld kennzeichnet (0)</td></tr>
            <tr><td><code>grid</code></td><td>25 Zeilen von oben nach unten, jede mit 25 Zahlen von links nach rechts</td></tr>
          </tbody>
        </table>
        <h2>Antwort</h2>
        <p>Gib das vollständig gelöste Sudoku als <strong>CSV</strong> ein: 25 Zeilen, je Zeile 25 Zahlen von links nach rechts,
        getrennt durch Komma, ohne Kopfzeile und ohne Anführungszeichen.</p>
        <div class="code-block"><pre><code>z1,z2,z3,…,z25
z1,z2,z3,…,z25
… (25 Zeilen)</code></pre></div>`,
      tips: `
        <ul>
          <li>Durchprobieren aller Belegungen ist bei 330 leeren Feldern aussichtslos. Eine <strong>Tiefensuche (Backtracking)</strong>
          führt zum Ziel, wenn du Äste des Suchbaums früh abschneidest.</li>
          <li>Führe für jedes leere Feld die Menge der noch möglichen Zahlen mit und aktualisiere sie nach jedem Eintrag.</li>
          <li>Wähle als Nächstes das Feld mit den <strong>wenigsten Möglichkeiten</strong>. Hat ein Feld keine Möglichkeit mehr, ist der aktuelle Ast falsch.</li>
          <li><strong>Einzige Möglichkeit:</strong> Bleibt für ein Feld nur eine Zahl, trage sie ein, ohne zu verzweigen.</li>
          <li><strong>Einziger Platz:</strong> Kann eine Zahl in einer Zeile, Spalte oder einem Block nur noch an einer Stelle stehen, gehört sie dorthin.</li>
          <li>Wer es eleganter mag: Sudoku ist ein Exact-Cover-Problem und lässt sich mit Knuths Algorithm X bzw. Dancing Links lösen.</li>
        </ul>`
    },
    {
      id: "vertex-cover",
      title: "Vertex Cover",
      summary: "Entferne so wenige Knoten wie möglich, damit im Graphen keine Kante übrig bleibt.",
      format: "wert", difficulty: "leicht", author: "Lena K.", version: 1, limit: 3,
      visibility: "öffentlich", state: "freigegeben",
      status: { kind: "geloest" },
      submission: { at: "2026-11-04T18:12:00", value: "6", version: 1, result: "bestanden" },
      answer: { type: "input", label: "Minimale Anzahl Knoten", hint: "Eine einzelne ganze Zahl, z. B. 4.", inputmode: "numeric" },
      task: `
        <p>Gegeben ist ein ungerichteter Graph aus Knoten und Kanten. Du darfst Knoten entfernen; mit einem Knoten verschwinden auch alle seine Kanten.</p>
        <p><strong>Wie viele Knoten musst du mindestens entfernen, damit im verbleibenden Graphen keine einzige Kante mehr übrig ist?</strong></p>
        <p>Eine solche Menge entfernter Knoten heißt <em>Knotenüberdeckung</em> (Vertex Cover): Jede Kante hat mindestens einen ihrer
        beiden Endknoten in der Menge. Gesucht ist die Größe der kleinsten Knotenüberdeckung.</p>
        <h2>Graph</h2>
        <figure class="figure">
          <div class="figure-frame"><img src="assets/challenges/vertex-cover.svg" width="680" height="380"
            alt="Graph mit 11 Knoten und 11 Kanten; die Kanten stehen vollständig in vertex-cover.txt"></div>
        </figure>
        <div class="downloads">
          <a class="btn btn-outline" href="assets/challenges/vertex-cover.txt" download>{{icon:download}} vertex-cover.txt</a>
          <a class="btn btn-outline" href="assets/challenges/vertex-cover.svg" download>{{icon:download}} vertex-cover.svg</a>
        </div>
        <h2>Datenformat</h2>
        <div class="code-block"><pre><code>1 2
2 3
2 4
…</code></pre></div>
        <ul>
          <li>Jede Zeile ist eine Kante: die IDs der beiden verbundenen Knoten, getrennt durch ein Leerzeichen.</li>
          <li>Knoten-IDs sind positive ganze Zahlen. Der Graph besteht genau aus den Knoten, die in der Datei vorkommen.</li>
          <li>Jede Kante steht genau einmal in der Datei; die Reihenfolge der Knoten in einer Zeile spielt keine Rolle.</li>
        </ul>
        <h2>Antwort</h2>
        <p>Gib die <strong>minimale Anzahl</strong> zu entfernender Knoten als einzelne ganze Zahl ein. Gefragt ist nur die Anzahl, nicht welche Knoten.</p>`,
      tips: `
        <ul>
          <li>Schau dir Knoten mit <strong>nur einer Kante</strong> an. Die Kante muss überdeckt werden, also muss einer ihrer beiden Endknoten weg.
          Den <strong>Nachbarn</strong> zu entfernen ist nie schlechter als den Knoten selbst, denn der Nachbar überdeckt mindestens dieselbe Kante,
          oft noch weitere. So findest du immer eine minimale Lösung.</li>
          <li>Wende die Regel wiederholt an: Nach dem Entfernen entstehen oft neue Knoten mit nur einer Kante.</li>
          <li>Was übrig bleibt, wenn kein Knoten mehr nur eine Kante hat, ist klein genug, um es von Hand zu lösen.</li>
        </ul>`
    },
    {
      id: "caesar",
      title: "Caesar knacken",
      summary: "Entschlüssle einen Text, der mit einer unbekannten Caesar-Verschiebung verschlüsselt wurde.",
      format: "wert", difficulty: "leicht", author: "Jonas M.", version: 2, limit: 5,
      visibility: "öffentlich", state: "freigegeben",
      status: { kind: "geloest" },
      submission: { at: "2026-09-21T10:03:00", value: "VENI VIDI VICI", version: 1, result: "bestanden" },
      answer: { type: "input", label: "Klartext", hint: "Groß- und Kleinschreibung spielt keine Rolle." },
      task: `<p>Der Text <code>YHQL YLGL YLFL</code> wurde mit einer Caesar-Verschiebung verschlüsselt. Finde den Klartext.</p>
        <p><em>Version 2:</em> Die Aufgabenstellung wurde präzisiert; die erwartete Lösung ist unverändert.</p>`,
      tips: `<ul><li>Es gibt nur 25 mögliche Verschiebungen.</li><li>Häufige Buchstaben im Deutschen und Lateinischen helfen beim Raten.</li></ul>`
    },
    {
      id: "url-shortener",
      title: "URL-Shortener als REST-Service",
      summary: "Baue einen HTTP-Service, der lange URLs in kurze Codes übersetzt und weiterleitet.",
      format: "code", difficulty: "mittel", author: "Jonas M.", version: 3, limit: 5,
      visibility: "öffentlich", state: "freigegeben",
      status: { kind: "nicht-geloest", cause: "nicht bestanden" },
      submission: { at: "2026-11-05T16:40:00", sha: "3f2a9c1", version: 3, result: "nicht bestanden", passed: 7, total: 9 },
      task: `<p>Implementiere einen Service mit den Endpunkten <code>POST /links</code> (legt einen Kurzlink an) und
        <code>GET /{code}</code> (leitet mit <code>302</code> weiter). Codes sind 6 Zeichen lang und eindeutig.</p>
        <p>Der Service muss den <a href="hilfe.html#vertrag">Lösungsvertrag</a> erfüllen: Port aus <code>PORT</code>, <code>GET /health</code> liefert <code>200</code>.</p>`,
      tips: `<ul><li>Für den MVP reicht eine In-Memory-Map.</li><li>Achte auf ungültige URLs: Antwort <code>400</code>.</li></ul>`,
      tests: [
        { group: "AnlegenTest", visibility: "öffentlich", items: ["Kurzlink für gültige URL anlegen", "Ungültige URL liefert 400", "Gleiche URL liefert neuen Code"] },
        { group: "WeiterleitungTest", visibility: "öffentlich", items: ["Bekannter Code leitet mit 302 weiter", "Unbekannter Code liefert 404"] },
        { group: "GrenzfaelleTest", visibility: "versteckt", items: ["Sehr lange URL", "URL mit Umlauten", "Viele Links nacheinander", "Code ist URL-sicher"] }
      ],
      failDetail: {
        test: "Ungültige URL liefert 400",
        request: 'POST /links\nContent-Type: application/json\n\n{"url": "kein-link"}',
        expected: "Status 400",
        actual: 'Status 201\n{"code": "aZ3kQ9", "url": "kein-link"}',
        assertion: "Expected status code <400> but was <201>.",
        hiddenTest: "URL mit Umlauten"
      },
      libraries: [
        ["io.javalin:javalin:6.3.0", "Library"],
        ["com.fasterxml.jackson.core:jackson-databind:2.18.1", "Library"],
        ["org.slf4j:slf4j-simple:2.0.16", "Library"],
        ["org.apache.maven.plugins:maven-shade-plugin:3.6.0", "Plugin"]
      ]
    },
    {
      id: "todo-api",
      title: "To-do-API",
      summary: "Eine kleine REST-API für To-dos mit Anlegen, Auflisten, Erledigen und Löschen.",
      format: "code", difficulty: "leicht", author: "Mira S.", version: 1, limit: 5,
      visibility: "öffentlich", state: "freigegeben",
      status: { kind: "nicht-geloest", cause: "Build-Fehler" },
      submission: { at: "2026-11-06T09:15:00", sha: "a81c0de", version: 1, result: "Fehler", cause: "Build-Fehler" },
      task: `<p>Implementiere <code>GET /todos</code>, <code>POST /todos</code>, <code>PATCH /todos/{id}</code> und <code>DELETE /todos/{id}</code>.</p>`,
      tips: `<ul><li>Nutze den Starter-Code, er enthält bereits einen lauffähigen Health-Check.</li></ul>`,
      tests: [
        { group: "TodoCrudTest", visibility: "öffentlich", items: ["To-do anlegen", "To-dos auflisten", "To-do erledigen", "To-do löschen"] },
        { group: "RobustheitTest", visibility: "versteckt", items: ["Unbekannte ID", "Leerer Titel", "Doppeltes Löschen"] }
      ],
      failDetail: {
        test: "To-do erledigen",
        request: 'PATCH /todos/1\nContent-Type: application/json\n\n{"done": true}',
        expected: 'Status 200\n{"id": 1, "done": true}',
        actual: 'Status 200\n{"id": 1, "done": false}',
        assertion: "JSON path $.done doesn't match. Expected: <true> Actual: <false>",
        hiddenTest: "Leerer Titel"
      },
      forbiddenLibrary: "org.apache.commons:commons-lang3:3.17.0",
      libraries: [
        ["io.javalin:javalin:6.3.0", "Library"],
        ["com.fasterxml.jackson.core:jackson-databind:2.18.1", "Library"],
        ["org.apache.maven.plugins:maven-shade-plugin:3.6.0", "Plugin"]
      ]
    },
    {
      id: "rate-limiter",
      title: "Rate-Limiter",
      summary: "Begrenze Anfragen pro Client mit einem Token-Bucket – korrekt auch bei parallelen Requests.",
      format: "code", difficulty: "schwer", author: "Mira S.", version: 2, limit: 3,
      visibility: "öffentlich", state: "freigegeben", isNew: true,
      status: { kind: "offen" },
      running: { sha: "c47e2b9" }, // Start- und Zeitpunkt setzt der Dummy beim ersten Aufruf
      task: `<p>Implementiere einen Service, der Requests pro <code>X-Client-Id</code> mit einem Token-Bucket begrenzt und bei Überschreitung <code>429</code> liefert.</p>`,
      tips: `<ul><li>Teste dein Verhalten bei parallelen Requests.</li></ul>`,
      tests: [
        { group: "GrundverhaltenTest", visibility: "öffentlich", items: ["Requests unter dem Limit liefern 200", "Request über dem Limit liefert 429", "Bucket füllt sich wieder auf"] },
        { group: "LastTest", visibility: "versteckt", items: ["Parallele Requests eines Clients", "Viele Clients gleichzeitig", "Bucket-Grenze exakt", "Fehlende Client-ID", "Langer Zeitraum"] }
      ],
      failDetail: {
        test: "Request über dem Limit liefert 429",
        request: "GET /resource\nX-Client-Id: test-1\n(11. Request innerhalb einer Sekunde)",
        expected: "Status 429",
        actual: "Status 200",
        assertion: "Expected status code <429> but was <200>.",
        hiddenTest: "Parallele Requests eines Clients"
      },
      libraries: [
        ["io.javalin:javalin:6.3.0", "Library"],
        ["org.apache.maven.plugins:maven-shade-plugin:3.6.0", "Plugin"]
      ]
    },
    {
      id: "json-api",
      title: "Bücher-API für den Workshop",
      summary: "Workshop-Aufgabe: eine JSON-API für eine kleine Bücherliste mit Suche.",
      format: "code", difficulty: "leicht", author: "Alex B.", version: 1, limit: 5,
      visibility: "privat", state: "freigegeben", shared: true,
      status: { kind: "offen" },
      owner: true, releasedAt: "2026-10-28T10:00:00",
      taskMd: "Implementiere `GET /books` mit optionalem Parameter `q` für die Suche im Titel und `GET /books/{isbn}`.\nDie Bücherliste liegt dem Starter-Code als JSON-Datei bei.",
      tipsMd: "- Die Suche soll Groß- und Kleinschreibung ignorieren.",
      files: { starter: "buecher-api-starter.zip", testscript: "buecher-api-tests.zip", reference: "buecher-api-referenz.zip" },
      shareLinks: [
        { id: "l1", label: "Workshop Backend November", created: "2026-11-06T08:00:00", expires: "2026-12-06T23:59:00", guests: 12, code: "Kq7xP2mZ" },
        { id: "l2", label: "", created: "2026-10-21T10:00:00", expires: "2026-11-20T10:00:00", guests: 2, code: "Tr4wN8cY" }
      ],
      task: `<p>Implementiere <code>GET /books</code> mit optionalem Parameter <code>q</code> für die Suche im Titel und
        <code>GET /books/{isbn}</code>. Die Bücherliste liegt dem Starter-Code als JSON-Datei bei.</p>`,
      tips: `<ul><li>Die Suche soll Groß- und Kleinschreibung ignorieren.</li></ul>`,
      tests: [
        { group: "BuecherListeTest", visibility: "öffentlich", items: ["Alle Bücher auflisten", "Suche nach Titel", "Buch per ISBN abrufen", "Unbekannte ISBN liefert 404"] },
        { group: "SucheErweitertTest", visibility: "versteckt", items: ["Suche ohne Treffer", "Suche mit Sonderzeichen"] }
      ],
      failDetail: {
        test: "Suche nach Titel",
        request: "GET /books?q=hobbit",
        expected: 'Status 200\n[{"isbn": "9780261102217", "title": "The Hobbit"}]',
        actual: "Status 200\n[]",
        assertion: "Expected list size <1> but was <0>.",
        hiddenTest: "Suche mit Sonderzeichen"
      },
      libraries: [
        ["io.javalin:javalin:6.3.0", "Library"],
        ["com.fasterxml.jackson.core:jackson-databind:2.18.1", "Library"],
        ["org.apache.maven.plugins:maven-shade-plugin:3.6.0", "Plugin"]
      ]
    },
    {
      id: "primzahlen",
      title: "Primzahl-Summe",
      summary: "Wie groß ist die Summe aller Primzahlen unter zwei Millionen?",
      format: "wert", difficulty: "leicht", author: "Jonas M.", version: 1, limit: 5,
      visibility: "öffentlich", state: "archiviert",
      status: { kind: "nicht-geloest", cause: "nicht bestanden" },
      submission: { at: "2026-08-12T20:31:00", value: "142913828", version: 1, result: "nicht bestanden" },
      answer: { type: "input", label: "Summe", hint: "Eine ganze Zahl ohne Tausendertrennzeichen.", inputmode: "numeric" },
      task: `<p>Berechne die Summe aller Primzahlen, die kleiner als 2.000.000 sind.</p>`,
      tips: `<ul><li>Das Sieb des Eratosthenes ist hier schnell genug.</li></ul>`
    },
    {
      id: "labyrinth",
      title: "Kürzester Weg im Labyrinth",
      summary: "Finde die Länge des kürzesten Wegs durch ein Labyrinth aus 200 × 200 Feldern.",
      format: "wert", difficulty: "mittel", author: "Mira S.", version: 1, limit: 5,
      visibility: "öffentlich", state: "gesperrt",
      status: { kind: "offen" },
      answer: { type: "input", label: "Weglänge", hint: "Anzahl der Schritte als ganze Zahl.", inputmode: "numeric" },
      task: `<p>Das Labyrinth ist als Textdatei gegeben: <code>#</code> ist eine Wand, <code>.</code> ein freies Feld, <code>S</code> der Start und <code>Z</code> das Ziel.</p>`,
      tips: `<ul><li>Breitensuche findet den kürzesten Weg in ungewichteten Gittern.</li></ul>`
    },

    /* ---------- Eigene Challenges des Autors (owner: true); Aufgabe und Tipps als Markdown ---------- */
    {
      id: "wortketten",
      title: "Wortketten",
      summary: "Finde die längste Kette aus Wörtern, bei der jedes Wort mit dem letzten Buchstaben des vorherigen beginnt.",
      format: "wert", difficulty: "mittel", author: "Alex B.", version: 2, limit: 5,
      visibility: "öffentlich", state: "freigegeben",
      status: { kind: "offen" },
      owner: true, releasedAt: "2026-10-02T14:00:00",
      answer: { type: "input", label: "Länge der längsten Kette", hint: "Eine ganze Zahl.", inputmode: "numeric" },
      taskMd: "Gegeben ist eine Liste von 500 deutschen Wörtern, ein Wort pro Zeile.\n\nBilde eine **Kette**, in der jedes Wort mit dem letzten Buchstaben des vorherigen Wortes beginnt. Jedes Wort darf höchstens einmal vorkommen.\n\n## Antwort\n\nGib die **Länge** der längsten möglichen Kette an.",
      tipsMd: "- Modelliere die Wörter als Kanten eines Graphen zwischen Anfangs- und Endbuchstaben.\n- Tiefensuche mit Abschneiden reicht bei 500 Wörtern aus.",
      solverFiles: ["woerter.txt"],
      expected: "17", normalization: ["trim"],
      shareLinks: [],
      draft: {
        changedAt: "2026-11-05T17:20:00",
        summary: "Finde die längste Kette aus Wörtern, bei der jedes Wort mit dem letzten Buchstaben des vorherigen beginnt.",
        tipsMd: "- Modelliere die Wörter als Kanten eines Graphen zwischen Anfangs- und Endbuchstaben.\n- Tiefensuche mit Abschneiden reicht bei 500 Wörtern aus.\n- Groß- und Kleinschreibung spielt keine Rolle: *Apfel* und *Nase* passen zusammen."
      }
    },
    {
      id: "matrix-spirale",
      title: "Matrix-Spirale",
      summary: "Lies eine 1000 × 1000-Matrix spiralförmig aus und bilde daraus eine Prüfsumme.",
      format: "wert", difficulty: "leicht", author: "Alex B.", version: 0, limit: 5,
      visibility: "privat", state: "entwurf",
      owner: true, changedAt: "2026-11-06T11:05:00",
      answer: { type: "input", label: "Prüfsumme", hint: "Eine ganze Zahl.", inputmode: "numeric" },
      taskMd: "Die Datei `matrix.txt` enthält eine Matrix mit 1000 × 1000 ganzen Zahlen.\n\nLies die Matrix **im Uhrzeigersinn spiralförmig** von außen nach innen aus, beginnend oben links.\n\n## Antwort\n\nGib die Summe aller Zahlen an, die an einer durch 7 teilbaren Position der Spirale stehen (Position 1 ist die erste Zahl).",
      tipsMd: "",
      solverFiles: [],
      expected: "", normalization: ["trim"],
      shareLinks: []
    },
    {
      id: "fibonacci-rest",
      title: "Fibonacci-Rest",
      summary: "Berechne die 10¹⁸-te Fibonacci-Zahl modulo 1 000 000 007.",
      format: "wert", difficulty: "schwer", author: "Alex B.", version: 1, limit: 3,
      visibility: "öffentlich", state: "archiviert",
      status: { kind: "offen" },
      owner: true, releasedAt: "2026-06-15T09:00:00",
      answer: { type: "input", label: "Ergebnis", hint: "Eine ganze Zahl.", inputmode: "numeric" },
      taskMd: "Berechne `F(10^18) mod 1 000 000 007`, wobei `F(1) = F(2) = 1` und `F(n) = F(n-1) + F(n-2)`.\n\n## Antwort\n\nGib das Ergebnis als ganze Zahl an.",
      tipsMd: "- Matrix-Potenzierung oder die Verdopplungsformeln führen in logarithmischer Zeit zum Ziel.",
      solverFiles: [], expected: "", normalization: ["trim"],
      shareLinks: []
    }
  ]
};
