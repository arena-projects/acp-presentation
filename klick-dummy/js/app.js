/* Klick-Dummy Coding Challenges – gemeinsamer Kern für alle Seiten.
   Seiten-Skripte (js/<seite>.js) nutzen window.CC. */
(function () {
  "use strict";
  const D = window.CC_DATA;
  const BUILT_PAGES = ["index.html", "katalog.html", "challenge.html", "ergebnis.html", "token.html", "hilfe.html", "konto.html",
    "link-ungueltig.html", "meine-challenges.html", "editor.html", "vorschau.html", "verwalten.html"];
  const PAGE_NAMES = { "datenschutz.html": "Datenschutz", "impressum.html": "Impressum" };
  const AUTHOR_PAGES = ["meine", "editor", "vorschau", "verwalten"];
  const PUBLIC_PAGES = ["login", "link-ungueltig"];

  /* ---------- Speicher (nur Demo-Komfort, darf fehlen) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("cc." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("cc." + k, JSON.stringify(v)); } catch (e) { /* ignorieren */ } },
    clear(keep) {
      try {
        Object.keys(localStorage).filter(k => k.startsWith("cc.") && !keep.includes(k.slice(3)))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) { /* ignorieren */ }
    }
  };

  /* ---------- Hilfsfunktionen ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = iso => new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtTime = d => new Date(d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const fmtDateTime = iso => fmtDate(iso) + ", " + fmtTime(iso) + " Uhr";
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const randomHex = n => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  const ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    warning: '<path d="M12 3.5L2.5 20h19L12 3.5z"/><path d="M12 10v4.5M12 17.4v.1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    dash: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12h7"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1"/><path d="M5 9v10.5h14V9M10 13h4"/>',
    share: '<circle cx="17.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="M8.7 10.8l6.6-4M8.7 13.2l6.6 4"/>',
    chevron: '<path d="M7 10l5 5 5-5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5"/>',
    logout: '<path d="M14.5 4.5H18a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5M10 16.5L5.5 12 10 7.5M5.5 12H15"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.6M12 16.9v.1"/>',
    git: '<circle cx="6.5" cy="6" r="2.2"/><circle cx="6.5" cy="18" r="2.2"/><circle cx="17.5" cy="9" r="2.2"/><path d="M6.5 8.2v7.6M17.5 11.2c0 3-4 3-8.8 5"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    spinner: '<path d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5" />'
  };
  const icon = (name, label) => `<svg class="icon${name === "spinner" ? " icon-spin" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${ICONS[name]}</svg>`;
  const withIcons = html => html.replace(/\{\{icon:(\w+)\}\}/g, (_, n) => icon(n));

  const BRAND_MARK = `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="cc-grad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#009EFF"/><stop offset=".55" stop-color="#624AEF"/><stop offset="1" stop-color="#D743EB"/></linearGradient></defs>
    <path d="M16 2l14 14-14 14L2 16z" fill="url(#cc-grad)"/><path d="M16 9.5l6.5 6.5-6.5 6.5-6.5-6.5z" fill="#fff" opacity=".9"/></svg>`;

  /* ---------- Direktlinks: ?rolle=nutzer|autor|gast, ?farbmodus=system|light|dark ---------- */
  if (["nutzer", "autor", "gast"].includes(params.get("rolle"))) store.set("role", params.get("rolle"));
  if (["system", "light", "dark"].includes(params.get("farbmodus"))) store.set("theme", params.get("farbmodus"));

  function applyTheme() {
    const t = store.get("theme", "system");
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }
  applyTheme();

  /* ---------- Rolle / simulierte Anmeldung ---------- */
  const role = store.get("role", null);
  const isGuest = role === "gast";
  const CC = window.CC = { halt: false };
  if (!PUBLIC_PAGES.includes(page) && !role) {
    CC.halt = true;
    location.replace("index.html?zurueck=" + encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash));
    return;
  }
  if (AUTHOR_PAGES.includes(page) && role !== "autor") {
    CC.halt = true;
    location.replace(isGuest ? "challenge.html?id=" + D.guestLink.challengeId : "katalog.html");
    return;
  }
  const guestChallengeId = D.guestLink.challengeId;

  /* ---------- Mini-Markdown (Überschriften, Absätze, Listen, Code, fett, kursiv, Links) ---------- */
  function md(src) {
    if (!src || !src.trim()) return "";
    const inline = s => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    const out = [];
    const lines = src.replace(/\r\n?/g, "\n").split("\n");
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(`<div class="code-block"><pre><code>${esc(buf.join("\n"))}</code></pre></div>`);
      } else if (/^#{1,3} /.test(l)) {
        const level = Math.min(3, l.match(/^#+/)[0].length + 1); // # → h2, damit h1 der Seitentitel bleibt
        out.push(`<h${level}>${inline(l.replace(/^#+ /, ""))}</h${level}>`); i++;
      } else if (/^\s*[-*] /.test(l) || /^\s*\d+\. /.test(l)) {
        const ordered = /^\s*\d+\. /.test(l), items = [];
        while (i < lines.length && (ordered ? /^\s*\d+\. /.test(lines[i]) : /^\s*[-*] /.test(lines[i]))) items.push(lines[i++].replace(/^\s*([-*]|\d+\.) /, ""));
        out.push(`<${ordered ? "ol" : "ul"}>${items.map(x => `<li>${inline(x)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
      } else if (!l.trim()) { i++; }
      else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^(#{1,3} |```|\s*[-*] |\s*\d+\. )/.test(lines[i])) buf.push(lines[i++]);
        out.push(`<p>${inline(buf.join(" "))}</p>`);
      }
    }
    return out.join("\n");
  }

  /* ---------- Simulierte Prüf-Pipeline ---------- */
  const OUTCOMES = [["bestanden", "bestanden"], ["nicht bestanden", "nicht bestanden"], ["Build-Fehler", "Build-Fehler"],
    ["Start-Fehler", "Start-Fehler (Health-Check)"], ["Sperrung", "Abbruch durch Sperrung"]];
  const T_QUEUED = 3, T_BUILD = 6, T_GROUP = 3; // Sekunden
  const STEPS = [["queued", "Wartet"], ["building", "Build"], ["testing", "Tests"], ["done", "Fertig"]];

  function statusFromOutcome(o) {
    if (o === "bestanden") return { kind: "geloest" };
    if (o === "nicht bestanden") return { kind: "nicht-geloest", cause: "nicht bestanden" };
    return { kind: "nicht-geloest", cause: o };
  }

  function buildResult(c, outcome) {
    const groups = c.tests.map(g => ({
      name: g.group, visibility: g.visibility,
      tests: g.items.map(n => ({ name: n, status: "passed" })),
      log: g.visibility === "öffentlich" ? serviceLog(c, g) : null
    }));
    const r = { outcome, groups, buildLog: "Build erfolgreich (mvn -o -q package), keine Ausgabe.\nErzeugt: target/solution-1.0.0.jar (2,4 MB)", buildOk: true };
    const f = c.failDetail;
    if (outcome === "nicht bestanden" && f) {
      groups.forEach(g => g.tests.forEach(t => {
        if (t.name === f.test) Object.assign(t, { status: "failed", request: f.request, expected: f.expected, actual: f.actual, assertion: f.assertion });
        if (t.name === f.hiddenTest) t.status = "failed";
      }));
    }
    if (outcome === "Build-Fehler") {
      r.buildOk = false;
      r.buildLog = c.forbiddenLibrary
        ? `[ERROR] Failed to execute goal on project solution: Could not resolve dependencies for project de.example:solution:jar:1.0.0
[ERROR] dependency: ${c.forbiddenLibrary.replace(/:([^:]+)$/, ":jar:$1")} (compile)
[ERROR]   Cannot access offline repository: artifact not available.
[ERROR] -> [Help 1]`
        : `[ERROR] COMPILATION ERROR :
[ERROR] /work/src/main/java/de/example/App.java:[42,17] cannot find symbol
[ERROR]   symbol:   method handle(io.javalin.http.Context)
[ERROR] -> [Help 1]`;
      r.buildHint = c.forbiddenLibrary
        ? `Die Library <code>${esc(c.forbiddenLibrary)}</code> steht nicht auf der Library-Liste dieser Challenge.`
        : "Der Quellcode ließ sich nicht kompilieren.";
      groups.forEach(g => { g.tests.forEach(t => { t.status = "skipped"; }); g.log = null; });
    }
    if (outcome === "Start-Fehler") {
      groups.forEach(g => g.tests.forEach(t => { t.status = "skipped"; }));
      groups[0].startError = "Der Service war nicht bereit: GET /health hat innerhalb von 30 Sekunden nicht mit 200 geantwortet.";
      if (groups[0].log) groups[0].log = `Exception in thread "main" java.lang.NumberFormatException: For input string: "PORT"
    at java.base/java.lang.Integer.parseInt(Integer.java:661)
    at de.example.App.main(App.java:12)`;
      groups.slice(1).forEach(g => { g.log = null; });
    }
    const all = groups.flatMap(g => g.tests);
    r.passed = all.filter(t => t.status === "passed").length;
    r.total = all.length;
    if (outcome === "bestanden") { r.result = "bestanden"; }
    else if (outcome === "nicht bestanden") { r.result = "nicht bestanden"; }
    else { r.result = "Fehler"; r.cause = outcome; }
    return r;
  }

  function serviceLog(c, g) {
    return `[main] INFO io.javalin.Javalin - Listening on http://0.0.0.0:8080/
[main] INFO io.javalin.Javalin - Javalin started in 412ms
` + g.items.map((n, i) => `[qtp-${21 + i}] INFO de.example.App - Request ${i + 1}: ${n}`).join("\n") + `
[main] INFO io.javalin.Javalin - Stopping Javalin ...`;
  }

  function liveState(c) {
    const r = c.running;
    const t = (Date.now() - r.startedAt) / 1000;
    if (t < T_QUEUED) return { step: "queued", groupsDone: 0 };
    if (t < T_QUEUED + T_BUILD) return { step: "building", groupsDone: 0 };
    if (r.outcome === "Build-Fehler") return { done: true };
    const idx = Math.floor((t - T_QUEUED - T_BUILD) / T_GROUP);
    if ((r.outcome === "Start-Fehler" || r.outcome === "Sperrung") && idx >= 1) return { done: true };
    if (idx >= c.tests.length) return { done: true };
    return { step: "testing", groupsDone: idx };
  }

  function finalize(c) {
    const r = c.running;
    const replaced = (c.replaced || []).slice();
    if (r.outcome === "Sperrung") {
      saveChallenge(c.id, { running: null, state: "gesperrt", aborted: { sha: r.sha, at: new Date().toISOString() } });
      return;
    }
    const report = buildResult(c, r.outcome);
    if (c.submission && c.submission.sha) replaced.push({ sha: c.submission.sha, by: r.sha });
    saveChallenge(c.id, {
      running: null, replaced,
      submission: { sha: r.sha, at: r.at, version: c.version, result: report.result, cause: report.cause, passed: report.passed, total: report.total, report },
      status: statusFromOutcome(r.outcome)
    });
  }

  /* ---------- Challenge-Zustand (Beispieldaten + lokale Änderungen) ---------- */
  const allBase = () => D.challenges.concat(store.get("created", []));
  function getChallenge(id) {
    let base = allBase().find(x => x.id === id);
    if (!base) return null;
    if (base.taskMd !== undefined && !base.task) base = Object.assign({}, base, { task: md(base.taskMd), tips: md(base.tipsMd) });
    let c = Object.assign({}, base, store.get("ch." + id, {}));
    if (c.deleted) return null;
    if (c.running && !c.running.startedAt) {
      // vorbelegte laufende Prüfung: beim ersten Aufruf mitten im Build starten
      const startedAt = Date.now() - (T_QUEUED + 1) * 1000;
      saveChallenge(id, { running: Object.assign({}, c.running, { startedAt, at: new Date(startedAt).toISOString(), outcome: store.get("outcome", "nicht bestanden") }) });
      c = Object.assign({}, base, store.get("ch." + id, {}));
    }
    if (c.running && liveState(c).done) {
      finalize(c);
      c = Object.assign({}, base, store.get("ch." + id, {}));
    }
    if (c.format === "code" && c.submission && !c.submission.report) {
      const s = c.submission;
      c.submission = Object.assign({}, s, { report: buildResult(c, s.result === "Fehler" ? s.cause : s.result) });
    }
    return c;
  }
  function saveChallenge(id, patch) {
    store.set("ch." + id, Object.assign(store.get("ch." + id, {}), patch));
  }
  const allChallenges = () => allBase().map(b => getChallenge(b.id));

  /* ---------- Entwürfe (Autor) ---------- */
  const DRAFT_FIELDS = ["title", "summary", "format", "difficulty", "limit", "taskMd", "tipsMd", "answer", "solverFiles",
    "expected", "normalization", "files", "libraries"];
  const pick = (o, keys) => keys.reduce((a, k) => { if (o[k] !== undefined) a[k] = JSON.parse(JSON.stringify(o[k])); return a; }, {});
  /* Liefert den Entwurf einer eigenen Challenge oder null, wenn es keinen gibt (create: aus aktueller Version anlegen) */
  function getDraft(id, create) {
    const c = getChallenge(id);
    if (!c) return null;
    const saved = store.get("draft." + id, null);
    if (saved) return saved;
    if (c.state === "entwurf") return Object.assign(pick(c, DRAFT_FIELDS), { changedAt: c.changedAt });
    if (c.draft) return Object.assign(pick(c, DRAFT_FIELDS), c.draft);
    if (create) {
      const d = Object.assign(pick(c, DRAFT_FIELDS), { changedAt: new Date().toISOString(), fresh: true });
      store.set("draft." + id, d);
      return d;
    }
    return null;
  }
  function saveDraft(id, patch) {
    const d = Object.assign({}, getDraft(id, true), patch, { changedAt: new Date().toISOString() });
    delete d.fresh;
    store.set("draft." + id, d);
    return d;
  }
  function deleteDraft(id) {
    const c = getChallenge(id);
    store.set("draft." + id, null);
    try { localStorage.removeItem("cc.draft." + id); } catch (e) { /* ignorieren */ }
    if (c.draft) saveChallenge(id, { draft: null });
    if (c.state === "entwurf") {
      store.set("created", store.get("created", []).filter(x => x.id !== id));
      saveChallenge(id, { deleted: true });
    }
  }
  function releaseDraft(id) {
    const c = getChallenge(id), d = getDraft(id);
    const patch = Object.assign(pick(d, DRAFT_FIELDS), {
      task: md(d.taskMd), tips: md(d.tipsMd), version: (c.version || 0) + 1, releasedAt: new Date().toISOString(),
      state: c.state === "entwurf" ? "freigegeben" : c.state, draft: null
    });
    saveChallenge(id, patch);
    try { localStorage.removeItem("cc.draft." + id); } catch (e) { /* ignorieren */ }
    return patch.version;
  }
  function createChallenge() {
    const id = "neu-" + randomHex(6);
    const created = store.get("created", []);
    created.push({
      id, title: "Neue Challenge", summary: "", format: "wert", difficulty: "leicht", author: D.user.name, version: 0, limit: 5,
      visibility: "privat", state: "entwurf", owner: true, changedAt: new Date().toISOString(),
      answer: { type: "input", label: "Antwort", hint: "" }, taskMd: "", tipsMd: "", solverFiles: [], expected: "",
      normalization: ["trim"], files: {}, libraries: [], shareLinks: [],
      tests: [{ group: "BeispielTest", visibility: "öffentlich", items: ["Health-Check antwortet"] }]
    });
    store.set("created", created);
    return id;
  }
  /* Gibt es etwas, das Löser noch nicht sehen? (nie freigegebener Entwurf oder Entwurf mit Änderungen) */
  function hasChanges(c) {
    if (c.state === "entwurf") return true;
    const d = getDraft(c.id);
    return !!d && !d.fresh;
  }
  /* Unternavigation einer eigenen Challenge: Bearbeiten · Verwalten · Vorschau (nur bei Änderungen) */
  function authorNav(c, current) {
    const items = [];
    if (c.state !== "archiviert") items.push(["editor", "Bearbeiten", `editor.html?id=${c.id}`]);
    if (c.state !== "entwurf") items.push(["verwalten", "Verwalten", `verwalten.html?id=${c.id}`]);
    if (hasChanges(c)) items.push(["vorschau", "Vorschau", `vorschau.html?id=${c.id}`]);
    return `<nav class="subnav" aria-label="Bereiche der Challenge"><ul>${items.map(([k, t, h]) =>
      `<li><a href="${h}" ${k === current ? 'aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul></nav>`;
  }
  function ownStateBadge(c) {
    const draft = getDraft(c.id);
    if (c.state === "entwurf") return `<span class="pill pill-neutral">${icon("circle")}Entwurf</span>`;
    if (c.state === "archiviert") return `<span class="pill pill-neutral">${icon("archive")}Archiviert</span>`;
    if (c.state === "gesperrt") return `<span class="pill pill-danger">${icon("lock")}Gesperrt</span>`;
    return `<span class="pill pill-success">${icon("check")}Freigegeben</span>${draft && !draft.fresh ? ` <span class="pill pill-info">Entwurf mit Änderungen</span>` : ""}`;
  }
  function shareLinks(c) { return store.get("links." + c.id, c.shareLinks || []); }
  function saveShareLinks(c, links) { store.set("links." + c.id, links); }
  function quota(c) {
    const now = Date.now();
    const used = store.get("used." + c.id, []).filter(t => now - t < 15 * 60 * 1000);
    return { left: Math.max(0, c.limit - used.length), next: used.length ? used[0] + 15 * 60 * 1000 : null };
  }
  function useQuota(c) {
    const now = Date.now();
    const used = store.get("used." + c.id, []).filter(t => now - t < 15 * 60 * 1000);
    used.push(now);
    store.set("used." + c.id, used);
    if (isGuest) store.set("guestLinkUsed", store.get("guestLinkUsed", 0) + 1);
  }
  const guestLinkLeft = () => Math.max(0, D.guestLink.linkLimitLeft - store.get("guestLinkUsed", 0));

  /* ---------- Bausteine ---------- */
  function statusInfo(c) {
    const s = c.status || { kind: "offen" };
    if (s.kind === "geloest") return { cls: "success", icon: "check", text: "Gelöst" };
    if (s.kind === "nicht-geloest") {
      return s.cause === "nicht bestanden"
        ? { cls: "danger", icon: "x", text: "Nicht gelöst – nicht bestanden" }
        : { cls: "warning", icon: "warning", text: "Nicht gelöst – " + s.cause };
    }
    return { cls: "neutral", icon: "circle", text: "Offen" };
  }
  // short: im Katalog ohne Ursache („Nicht gelöst“); die Ursache zeigt nur die Challenge-Seite
  function statusPill(c, short) {
    let s = statusInfo(c);
    if (short && (c.status || {}).kind === "nicht-geloest") s = { cls: "danger", icon: "x", text: "Nicht gelöst" };
    return `<span class="pill pill-${s.cls}">${icon(s.icon)}${esc(s.text)}</span>`;
  }
  function resultPill(result, cause) {
    if (result === "bestanden") return `<span class="pill pill-success">${icon("check")}Bestanden</span>`;
    if (result === "nicht bestanden") return `<span class="pill pill-danger">${icon("x")}Nicht bestanden</span>`;
    return `<span class="pill pill-warning">${icon("warning")}${cause ? esc(cause) : "Fehler"}</span>`;
  }
  function runningPill(step) {
    const label = (STEPS.find(s => s[0] === step) || STEPS[0])[1];
    return `<span class="pill pill-info">${icon("spinner")}Prüfung läuft – ${label}</span>`;
  }
  const TEST_STATUS = {
    passed: ["success", "check", "bestanden"], failed: ["danger", "x", "fehlgeschlagen"], error: ["warning", "warning", "Fehler"],
    timeout: ["danger", "clock", "Zeitüberschreitung"], skipped: ["neutral", "dash", "nicht ausgeführt"],
    running: ["info", "spinner", "läuft"], waiting: ["neutral", "circle", "wartet"]
  };
  const testStatus = s => { const [cls, ic, text] = TEST_STATUS[s]; return `<span class="test-status text-${cls}">${icon(ic)}<span>${text}</span></span>`; };
  const formatLabel = f => (f === "wert" ? "Wert" : "Code");
  const diffLabel = d => d.charAt(0).toUpperCase() + d.slice(1);
  function tagsHtml(c) {
    let t = `<li><span class="tag">${formatLabel(c.format)}</span></li><li><span class="tag">${diffLabel(c.difficulty)}</span></li>`;
    if (c.shared && !isGuest) t += `<li><span class="badge">${icon("share")}Geteilt</span></li>`;
    if (c.isNew) t += `<li><span class="badge">Neu</span></li>`;
    if (c.owner && role === "autor" && c.visibility === "privat") t += `<li><span class="badge badge-muted">${icon("lock")}Privat</span></li>`;
    if (c.state === "archiviert") t += `<li><span class="badge badge-muted">${icon("archive")}Archiviert</span></li>`;
    if (c.state === "gesperrt") t += `<li><span class="badge badge-muted">${icon("lock")}Gesperrt</span></li>`;
    return `<ul class="tags" aria-label="Eigenschaften">${t}</ul>`;
  }
  const notice = (variant, iconName, title, body) =>
    `<div class="notice notice-${variant}">${icon(iconName)}<div class="notice-body">${title ? `<strong class="notice-title">${title}</strong>` : ""}${body || ""}</div></div>`;
  function stepper(current, failedAt) {
    const idx = STEPS.findIndex(s => s[0] === current);
    const failIdx = STEPS.findIndex(s => s[0] === failedAt);
    return `<ol class="stepper" aria-label="Prüffortschritt">${STEPS.map(([k, label], i) => {
      let cls = "pending", ic = "circle", sr = "ausstehend";
      if (failedAt === k) { cls = "failed"; ic = "warning"; sr = "fehlgeschlagen"; }
      else if (failIdx >= 0 && i > failIdx && k !== "done") { cls = "pending"; ic = "dash"; sr = "übersprungen"; }
      else if (i < idx || current === "done") { cls = "done"; ic = "check"; sr = "abgeschlossen"; }
      else if (i === idx) { cls = "current"; ic = "spinner"; sr = "läuft"; }
      return `<li class="step step-${cls}" ${i === idx && current !== "done" ? 'aria-current="step"' : ""}>${icon(ic)}<span>${label}</span><span class="visually-hidden"> (${sr})</span></li>`;
    }).join("")}</ol>`;
  }
  function addCopyButtons(root) {
    root.querySelectorAll(".code-block").forEach(block => {
      if (block.querySelector(".copy") || block.classList.contains("no-copy")) return;
      block.insertAdjacentHTML("beforeend", `<button class="btn btn-outline btn-sm copy" type="button" data-copy>${icon("copy")}Kopieren</button>`);
    });
  }

  /* ---------- Toast, Live-Region, Dialog ---------- */
  let toastRegion;
  function toast(msg) {
    if (!toastRegion) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  function announce(msg) {
    let live = $("#cc-live");
    if (!live) {
      live = document.createElement("p");
      live.id = "cc-live"; live.className = "visually-hidden"; live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    live.textContent = msg;
  }
  /* Bestätigungsdialog; requireCheck: Text einer Checkbox, die vor dem Bestätigen angehakt sein muss */
  function confirmDialog({ title, body, confirmLabel, danger, requireCheck }) {
    return new Promise(resolve => {
      const dlg = document.createElement("dialog");
      dlg.className = "dialog";
      dlg.setAttribute("aria-labelledby", "dlg-title");
      dlg.innerHTML = `<div class="dialog-inner">
          <h2 id="dlg-title">${title}</h2>
          <div class="dialog-body">${body}</div>
          ${requireCheck ? `<label class="check"><input type="checkbox" id="dlg-check"> <span>${requireCheck}</span></label>` : ""}
          <div class="dialog-actions">
            <button class="btn btn-outline" type="button" id="dlg-cancel">Abbrechen</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"}" type="button" id="dlg-ok" ${requireCheck ? "disabled" : ""}>${confirmLabel}</button>
          </div>
        </div>`;
      document.body.appendChild(dlg);
      const check = $("#dlg-check", dlg);
      if (check) check.addEventListener("change", () => { $("#dlg-ok", dlg).disabled = !check.checked; });
      const opener = document.activeElement;
      let finished = false;
      const finish = ok => {
        if (finished) return;
        finished = true;
        if (dlg.open) dlg.close();
        dlg.remove();
        if (opener && opener.focus && document.contains(opener)) opener.focus();
        resolve(ok);
      };
      $("#dlg-cancel", dlg).addEventListener("click", e => { e.stopPropagation(); finish(false); });
      $("#dlg-ok", dlg).addEventListener("click", e => { e.stopPropagation(); finish(true); });
      dlg.addEventListener("close", () => finish(false)); // Esc
      dlg.showModal();
      $("#dlg-cancel", dlg).focus();
    });
  }

  /* ---------- Kopfzeile ---------- */
  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const anonymous = !role;
    const navCurrent = { katalog: "challenges", challenge: "challenges", ergebnis: "challenges", hilfe: "hilfe",
      meine: "meine", editor: "meine", vorschau: "meine", verwalten: "meine" }[page];
    const cur = k => (navCurrent === k ? 'aria-current="page"' : "");
    let nav = "", menu = "";
    if (anonymous) {
      nav = "";
    } else if (isGuest) {
      const gc = D.challenges.find(x => x.id === guestChallengeId);
      nav = `<li><a href="challenge.html?id=${gc.id}" ${cur("challenges")}>${esc(gc.title)}</a></li>
             <li><a href="hilfe.html" ${cur("hilfe")}>Hilfe</a></li>`;
      menu = `<button class="menu-button is-guest" type="button" aria-expanded="false" aria-controls="user-menu-panel" data-menu-button>
                ${icon("user")}<span>Gast</span>${icon("chevron")}</button>
              <div class="menu-panel" id="user-menu-panel" hidden>
                <div class="menu-head">
                  <strong>Zugang über Teilen-Link</strong>
                  <p class="small muted" style="margin:var(--space-1) 0 0">Gültig bis <strong>${fmtDate(D.guestLink.expires)}</strong>.
                  Danach werden deine Einreichungen und Ergebnisse gelöscht.</p>
                </div>
                <ul>
                  <li><a href="token.html">${icon("key")}Push-Token</a></li>
                  <li><a href="hilfe.html">${icon("help")}Hilfe</a></li>
                </ul>
              </div>`;
    } else {
      nav = `<li><a href="katalog.html" ${cur("challenges")}>Challenges</a></li>
             ${role === "autor" ? `<li><a href="meine-challenges.html" ${cur("meine")}>Meine Challenges</a></li>` : ""}
             <li><a href="hilfe.html" ${cur("hilfe")}>Hilfe</a></li>`;
      menu = `<button class="menu-button" type="button" aria-expanded="false" aria-controls="user-menu-panel" data-menu-button>
                <span class="avatar" aria-hidden="true">${D.user.initials}</span>
                <span class="visually-hidden">Profilmenü von ${esc(D.user.name)}</span>${icon("chevron")}</button>
              <div class="menu-panel" id="user-menu-panel" hidden>
                <div class="menu-head"><strong>${esc(D.user.name)}</strong><br><span class="small muted">${esc(D.user.email)}${role === "autor" ? " · Autor" : ""}</span></div>
                <ul>
                  <li><a href="token.html">${icon("key")}Push-Token</a></li>
                  <li><a href="konto.html">${icon("user")}Meine Daten</a></li>
                  <li class="sep" role="presentation"></li>
                  <li><button class="menu-item" type="button" data-logout>${icon("logout")}Abmelden</button></li>
                </ul>
              </div>`;
    }
    const home = anonymous ? "index.html" : isGuest ? `challenge.html?id=${guestChallengeId}` : "katalog.html";
    host.outerHTML = `
      <a class="skip-link" href="#main">Zum Inhalt springen</a>
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="${home}">${BRAND_MARK}<span class="brand-name">Coding Challenges</span><span class="visually-hidden"> – Startseite</span></a>
          ${nav ? `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${icon("menu")}Menü</button>
          <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><ul>${nav}</ul></nav>` : ""}
          ${menu ? `<div class="menu">${menu}</div>` : ""}
        </div>
      </header>`;
  }

  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.outerHTML = `<footer class="site-footer"><div class="footer-inner">
      ${role ? '<a href="hilfe.html">Hilfe</a>' : ""}<a href="datenschutz.html">Datenschutz</a><a href="impressum.html">Impressum</a></div></footer>`;
  }

  /* ---------- Demo-Leiste (nur Klick-Dummy) ---------- */
  function renderDemoBar() {
    const bar = document.createElement("aside");
    bar.className = "demo-bar";
    bar.setAttribute("aria-label", "Demo-Steuerung des Klick-Dummys");
    const sel = (id, label, opts, val) => `<label for="${id}">${label}<select id="${id}">${opts.map(([v, t]) => `<option value="${v}" ${v === val ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
    bar.innerHTML = `<div class="demo-inner">
      <strong>Demo</strong>
      ${role ? sel("demo-role", "Rolle", [["nutzer", "Nutzer"], ["autor", "Autor"], ["gast", "Gast (Teilen-Link)"]], role) : ""}
      ${sel("demo-outcome", "Nächstes Prüfergebnis", OUTCOMES, store.get("outcome", "nicht bestanden"))}
      ${sel("demo-theme", "Farbmodus", [["system", "System"], ["light", "Hell"], ["dark", "Dunkel"]], store.get("theme", "system"))}
      <button type="button" data-demo-reset>Daten zurücksetzen</button>
    </div>`;
    document.body.appendChild(bar);
    const fit = () => { document.body.style.paddingBottom = bar.offsetHeight + "px"; };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(bar); else fit();

    bar.addEventListener("change", e => {
      if (e.target.id === "demo-theme") { store.set("theme", e.target.value); applyTheme(); }
      if (e.target.id === "demo-outcome") store.set("outcome", e.target.value);
      if (e.target.id === "demo-role") {
        store.set("role", e.target.value);
        if (e.target.value === "gast") location.href = "challenge.html?id=" + guestChallengeId;
        else if (isGuest) location.href = "katalog.html";
        else location.reload();
      }
    });
    bar.addEventListener("click", e => {
      if (e.target.closest("[data-demo-reset]")) { store.clear(["role", "theme"]); location.reload(); }
    });
  }

  /* ---------- Menüs, Navigation, Links ---------- */
  function wireGlobal() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-menu-button]");
      document.querySelectorAll("[data-menu-button]").forEach(b => {
        if (b !== btn) { b.setAttribute("aria-expanded", "false"); document.getElementById(b.getAttribute("aria-controls")).hidden = true; }
      });
      if (btn) {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
      }
      const navToggle = e.target.closest(".nav-toggle");
      if (navToggle) {
        const open = navToggle.getAttribute("aria-expanded") !== "true";
        navToggle.setAttribute("aria-expanded", String(open));
        $("#site-nav").classList.toggle("is-open", open);
      }
      if (e.target.closest("[data-logout]")) { store.set("role", null); location.href = "index.html"; return; }

      const a = e.target.closest("a[href]");
      if (a && !a.hasAttribute("download") && !a.getAttribute("href").startsWith("#")) {
        const file = a.getAttribute("href").split(/[?#]/)[0];
        if (file.endsWith(".html") && !BUILT_PAGES.includes(file)) {
          e.preventDefault();
          toast(`„${PAGE_NAMES[file] || file}“ folgt im nächsten Schritt des Klick-Dummys.`);
        }
      }
      const copy = e.target.closest("[data-copy]");
      if (copy) {
        const text = copy.closest(".code-block").querySelector("code").innerText;
        const done = () => toast("In die Zwischenablage kopiert");
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
      }
      if (e.target.closest("[data-fake-download]")) toast("Downloads sind im Klick-Dummy nicht enthalten.");
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      const openBtn = document.querySelector('[data-menu-button][aria-expanded="true"]');
      if (openBtn) { openBtn.click(); openBtn.focus(); }
      const navToggle = $('.nav-toggle[aria-expanded="true"]');
      if (navToggle) { navToggle.click(); navToggle.focus(); }
    });
  }

  /* ---------- Seite: Login (simulierter IdP) ---------- */
  function initLogin() {
    if (params.get("geloescht")) $("#login-notice").innerHTML = notice("success", "check", "Dein Account wurde gelöscht", "<p>Alle zugehörigen Daten wurden entfernt.</p>");
    const form = $("#login-form");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const r = new FormData(form).get("role");
      store.set("role", r);
      const back = params.get("zurueck");
      if (r === "gast") location.href = "challenge.html?id=" + guestChallengeId;
      else location.href = back && !back.startsWith("index") ? back : "katalog.html";
    });
  }

  /* ---------- Export für Seiten-Skripte ---------- */
  Object.assign(CC, {
    D, store, $, esc, fmtDate, fmtTime, fmtDateTime, params, page, role, isGuest, guestChallengeId, randomHex,
    icon, withIcons, notice, statusPill, resultPill, runningPill, testStatus, tagsHtml, stepper, addCopyButtons,
    getChallenge, saveChallenge, allChallenges, quota, useQuota, guestLinkLeft, liveState, buildResult, STEPS,
    md, getDraft, saveDraft, hasChanges, deleteDraft, releaseDraft, createChallenge, authorNav, ownStateBadge, shareLinks, saveShareLinks,
    toast, announce, confirmDialog
  });

  renderHeader();
  renderFooter();
  toastRegion = document.createElement("div");
  toastRegion.className = "toast-region";
  toastRegion.setAttribute("role", "status");
  document.body.appendChild(toastRegion);
  renderDemoBar();
  wireGlobal();
  if (page === "login") initLogin();
})();
