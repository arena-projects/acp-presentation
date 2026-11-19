/* Seite: Challenge bearbeiten (Entwurf) */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { $, esc, icon, notice, params, store } = CC;

  const id = params.get("id");
  let c = CC.getChallenge(id);
  if (!c || !c.owner) { location.replace("meine-challenges.html"); return; }
  if (c.state === "archiviert") { location.replace("verwalten.html?id=" + id); return; }
  let d = CC.getDraft(id, true);
  const released = c.state !== "entwurf";

  const NORMALIZATIONS = [
    ["trim", "Leerzeichen am Anfang und Ende entfernen"],
    ["case", "Groß- und Kleinschreibung ignorieren"],
    ["csv", "CSV-Tabelle: Zeilenenden vereinheitlichen, leere Randzeilen entfernen, Zellen einzeln trimmen"]
  ];
  const libsSig = () => JSON.stringify(d.libraries || []);
  const refSig = () => libsSig() + JSON.stringify(d.files || {});

  /* ---------- Speichern ---------- */
  let saveTimer;
  function save(patch, immediate) {
    Object.assign(d, patch);
    clearTimeout(saveTimer);
    const run = () => {
      d = CC.saveDraft(id, d);
      $("#save-state").innerHTML = `${icon("check")}Entwurf gespeichert um ${CC.fmtTime(d.changedAt)} Uhr`;
      $("#subnav").innerHTML = CC.authorNav(c, "editor");
      renderRelease();
    };
    if (immediate) run(); else saveTimer = setTimeout(run, 400);
  }

  /* ---------- Bausteine ---------- */
  function mdEditor(key, label, hint, rows) {
    return `<div class="field md-editor" data-md="${key}">
      <div class="md-head">
        <label for="f-${key}">${label}</label>
        <div class="segmented" role="group" aria-label="Ansicht für ${label}">
          <button type="button" class="seg" aria-pressed="true" data-md-mode="write">Schreiben</button>
          <button type="button" class="seg" aria-pressed="false" data-md-mode="preview">Vorschau</button>
        </div>
      </div>
      <textarea class="textarea md-input" id="f-${key}" rows="${rows}" data-field="${key}" aria-describedby="h-${key}">${esc(d[key] || "")}</textarea>
      <div class="md-preview prose" hidden></div>
      <span class="hint" id="h-${key}">${hint}</span>
    </div>`;
  }
  function fileField(key, label, hint) {
    const name = (d.files || {})[key];
    return `<div class="field file-field">
      <span class="label" id="l-${key}">${label}</span>
      <div class="file-row">
        ${name ? `<span class="file-name">${icon("archive")}<code>${esc(name)}</code></span>` : `<span class="muted">Noch keine Datei</span>`}
        <label class="btn btn-outline btn-sm file-btn">${name ? "Ersetzen" : "Hochladen"}
          <input type="file" accept=".zip" data-file="${key}" aria-labelledby="l-${key}" class="visually-hidden"></label>
      </div>
      <span class="hint">${hint}</span>
    </div>`;
  }

  /* ---------- Abschnitte ---------- */
  function metaHtml() {
    return `<section class="card" id="s-meta" aria-labelledby="h-meta">
      <h2 id="h-meta">Metadaten</h2>
      <div class="field"><label for="f-title">Titel</label><input class="input" id="f-title" data-field="title" value="${esc(d.title)}" required aria-required="true"></div>
      <div class="field"><label for="f-summary">Kurzbeschreibung</label><input class="input" id="f-summary" data-field="summary" value="${esc(d.summary || "")}" aria-describedby="h-summary">
        <span class="hint" id="h-summary">Erscheint im Katalog auf der Karte der Challenge.</span></div>
      <fieldset class="field">
        <legend class="label">Lösungsformat</legend>
        <div class="radio-row">
          <label class="check"><input type="radio" name="format" value="wert" ${d.format === "wert" ? "checked" : ""} ${released ? "disabled" : ""}> <span>Wert – Löser geben einen Lösungswert ein</span></label>
          <label class="check"><input type="radio" name="format" value="code" ${d.format === "code" ? "checked" : ""} ${released ? "disabled" : ""}> <span>Code – Löser reichen ein Maven-Projekt per <code>git push</code> ein</span></label>
        </div>
        ${released ? `<span class="hint">Das Format lässt sich nach der ersten Freigabe nicht mehr ändern.</span>` : ""}
      </fieldset>
      <div class="field-row">
        <div class="field"><label for="f-difficulty">Schwierigkeit</label>
          <select class="select" id="f-difficulty" data-field="difficulty">${["leicht", "mittel", "schwer"].map(x => `<option value="${x}" ${d.difficulty === x ? "selected" : ""}>${x[0].toUpperCase() + x.slice(1)}</option>`).join("")}</select></div>
        <div class="field"><label for="f-limit">Einreichungs-Limit pro 15 Minuten</label>
          <input class="input" id="f-limit" type="number" min="1" max="10" data-field="limit" value="${d.limit}" aria-describedby="h-limit">
          <span class="hint" id="h-limit">Höchstens 10 (Obergrenze der Plattform). Löser sehen das Limit erst, wenn sie es erreichen.</span></div>
      </div>
    </section>`;
  }

  function textHtml() {
    return `<section class="card" id="s-text" aria-labelledby="h-text">
      <h2 id="h-text">Aufgabe und Tipps</h2>
      ${mdEditor("taskMd", "Aufgabenstellung", "Markdown: <code>## Überschrift</code>, <code>**fett**</code>, <code>`Code`</code>, Listen mit <code>-</code>, Codeblöcke mit <code>```</code>.", 10)}
      ${mdEditor("tipsMd", "Tipps und Hinweise", "Optional. Erscheint im Tab „Tipps“.", 5)}
    </section>`;
  }

  function solutionWertHtml() {
    const a = d.answer || { type: "input", label: "Antwort", hint: "" };
    const norm = d.normalization || [];
    return `<section class="card" id="s-solution" aria-labelledby="h-solution">
      <h2 id="h-solution">Lösung</h2>
      <div class="field"><span class="label">Dateien für Löser</span>
        <ul class="file-list">${(d.solverFiles || []).map((f, i) => `<li><span class="file-name">${icon("download")}<code>${esc(f)}</code></span>
          <button class="btn btn-outline btn-sm" type="button" data-remove-file="${i}">Entfernen<span class="visually-hidden">: ${esc(f)}</span></button></li>`).join("") || '<li class="muted">Keine Dateien</li>'}</ul>
        <label class="btn btn-outline btn-sm file-btn" style="width:max-content">${icon("download")}Datei hinzufügen
          <input type="file" multiple data-solver-files class="visually-hidden"></label>
        <span class="hint">Eingabedaten, Bilder oder andere Dateien, die Löser im Tab „Aufgabe“ herunterladen.</span>
      </div>
      <div class="field-row">
        <div class="field"><label for="f-alabel">Beschriftung des Antwortfelds</label><input class="input" id="f-alabel" data-answer="label" value="${esc(a.label)}"></div>
        <div class="field"><label for="f-ahint">Hinweis zum Antwortformat</label><input class="input" id="f-ahint" data-answer="hint" value="${esc(a.hint || "")}"></div>
      </div>
      <label class="check" style="margin-bottom:var(--space-4)"><input type="checkbox" data-answer-multi ${a.type === "textarea" ? "checked" : ""}> <span>Mehrzeiliges Antwortfeld (z. B. für Tabellen)</span></label>
      <div class="field"><label for="f-expected">Erwarteter Wert</label>
        <textarea class="textarea" id="f-expected" rows="3" data-field="expected" spellcheck="false" aria-describedby="h-expected">${esc(d.expected || "")}</textarea>
        <span class="hint" id="h-expected">Nur für dich sichtbar. Löser sehen den Wert nie, auch nicht in Vorschau oder Fehlermeldungen.</span></div>
      <fieldset class="field"><legend class="label">Normalisierung vor dem Vergleich</legend>
        ${NORMALIZATIONS.map(([k, t]) => `<label class="check"><input type="checkbox" data-norm="${k}" ${norm.includes(k) ? "checked" : ""}> <span>${t}</span></label>`).join("")}
      </fieldset>
      <div class="try-box">
        <div class="field" style="margin-bottom:var(--space-3)"><label for="f-try">Antwort testen</label>
          <input class="input" id="f-try" autocomplete="off" aria-describedby="h-try"><span class="hint" id="h-try">Prüft eine Beispiel-Antwort gegen den erwarteten Wert mit der gewählten Normalisierung.</span></div>
        <button class="btn btn-outline" type="button" data-try>Testen</button>
        <div id="try-result" aria-live="polite" style="margin-top:var(--space-3)"></div>
      </div>
    </section>`;
  }

  function solutionCodeHtml() {
    const libs = d.libraries || [];
    return `<section class="card" id="s-solution" aria-labelledby="h-solution">
      <h2 id="h-solution">Lösung und Tests</h2>
      ${fileField("starter", "Starter-Code", "Maven-Projekt, das Löser herunterladen. Es sollte die Libraries dieser Challenge bereits enthalten.")}
      ${fileField("testscript", "Testskript", "JUnit-5-Projekt. Jede Testklasse trägt genau ein Tag <code>@Tag(\"public\")</code> oder <code>@Tag(\"hidden\")</code> auf Klassenebene. <a href=\"hilfe.html\">Vorlage und Test-Liste</a>")}
      ${fileField("reference", "Referenzlösung", "Muss alle Tests bestehen, bevor du freigeben kannst.")}
    </section>
    <section class="card" id="s-libs" aria-labelledby="h-libs">
      <h2 id="h-libs">Library-Liste</h2>
      <p class="muted small">Libraries und Maven-Plugins, die Lösungen verwenden dürfen. Abhängigkeiten werden automatisch aufgelöst.
        Plugins, die beim Build weitere Artefakte nachladen, brauchen diese ebenfalls auf der Liste.</p>
      <div class="table-card" style="overflow-x:auto">
      <table class="lib-table"><caption class="visually-hidden">Library-Liste</caption>
        <thead><tr><th scope="col">Maven-Koordinaten</th><th scope="col">Art</th><th scope="col"><span class="visually-hidden">Aktion</span></th></tr></thead>
        <tbody>${libs.map(([coord, kind], i) => `<tr><td>${esc(coord)}</td><td>${kind}</td>
          <td><button class="btn btn-outline btn-sm" type="button" data-remove-lib="${i}">Entfernen<span class="visually-hidden">: ${esc(coord)}</span></button></td></tr>`).join("")
          || '<tr><td colspan="3" class="muted">Noch keine Einträge</td></tr>'}</tbody>
      </table></div>
      <form class="lib-add" id="lib-add" novalidate>
        <div class="field"><label for="f-coord">Maven-Koordinaten</label>
          <input class="input mono-input" id="f-coord" placeholder="groupId:artifactId:version" aria-describedby="e-coord" autocomplete="off" spellcheck="false">
          <span class="error" id="e-coord" hidden>${icon("warning")}<span>Bitte im Format <code>groupId:artifactId:version</code> angeben.</span></span></div>
        <div class="field"><label for="f-kind">Art</label><select class="select" id="f-kind"><option>Library</option><option>Plugin</option></select></div>
        <button class="btn btn-outline" type="submit">Hinzufügen</button>
      </form>
    </section>
    <section class="card" id="s-checks" aria-labelledby="h-checks">
      <h2 id="h-checks">Prüfungen vor der Freigabe</h2>
      <div id="checks"></div>
    </section>`;
  }

  function checkRow(title, desc, state, action) {
    const map = { ok: ["success", "check", "bestanden"], fail: ["danger", "x", "fehlgeschlagen"], run: ["info", "spinner", "läuft"], none: ["neutral", "circle", "noch nicht geprüft"] };
    const [cls, ic, text] = map[state.status];
    return `<div class="check-item">
      <div class="check-head"><h3>${title}</h3><span class="pill pill-${cls}">${icon(ic)}${text}</span></div>
      <p class="small muted">${desc}</p>
      ${state.msg ? `<div class="check-msg">${state.msg}</div>` : ""}
      ${action}
    </div>`;
  }

  function checkState(key, sig) {
    const ch = (d.checks || {})[key];
    if (running[key]) return { status: "run" };
    if (!ch || ch.sig !== sig) return { status: "none" };
    return ch;
  }
  const running = {};

  function renderChecks() {
    if (d.format !== "code") return;
    const libs = checkState("libs", libsSig()), ref = checkState("ref", refSig());
    const filesOk = d.files && d.files.testscript && d.files.reference;
    $("#checks").innerHTML =
      checkRow("Libraries auflösen", "Die Plattform lädt alle Einträge der Library-Liste samt Abhängigkeiten aus den erlaubten Repositories.", libs,
        `<button class="btn btn-outline btn-sm" type="button" data-check="libs" ${running.libs || !(d.libraries || []).length ? "disabled" : ""}>Jetzt prüfen</button>`) +
      checkRow("Testskript bauen und gegen die Referenzlösung prüfen", "Baut das Testskript in der Sandbox, prüft die Tags der Testklassen und lässt alle Tests gegen die Referenzlösung laufen.", ref,
        `<button class="btn btn-outline btn-sm" type="button" data-check="ref" ${running.ref || !filesOk || libs.status !== "ok" ? "disabled" : ""}>Jetzt prüfen</button>
         ${!filesOk || libs.status !== "ok" ? '<span class="small muted"> Voraussetzung: Testskript, Referenzlösung und aufgelöste Libraries.</span>' : ""}`);
  }

  function runCheck(key) {
    running[key] = true; renderChecks(); renderRelease();
    CC.announce(key === "libs" ? "Libraries werden aufgelöst" : "Testskript wird gegen die Referenzlösung geprüft");
    setTimeout(() => {
      running[key] = false;
      let res;
      if (key === "libs") {
        const bad = (d.libraries || []).filter(([coord]) => /snapshot|unknown|example/i.test(coord));
        res = bad.length
          ? { status: "fail", msg: notice("danger", "x", "Nicht auflösbar", `<p>${bad.map(([x]) => `<code>${esc(x)}</code>`).join(", ")} wurde in den erlaubten Repositories nicht gefunden.</p>`) }
          : { status: "ok", msg: `<p class="small">${d.libraries.length} Einträge aufgelöst: ${d.libraries.length * 9 + 4} Artefakte, ${(d.libraries.length * 2.1).toFixed(1).replace(".", ",")} MB.</p>` };
        res.sig = libsSig();
      } else {
        const outcome = store.get("outcome", "nicht bestanden");
        const groups = (c.tests || []).map(g => `<li><strong>${esc(g.group)}</strong> <span class="tag">${g.visibility}</span> – ${g.items.length} Tests</li>`).join("");
        if (outcome === "bestanden") res = { status: "ok", msg: `<p class="small">Alle Tests bestanden. Gefundene Testgruppen:</p><ul class="small">${groups}</ul>` };
        else if (outcome === "Build-Fehler") res = { status: "fail", msg: notice("danger", "x", "Testskript abgelehnt", `<p>Die Testklasse <code>${esc((c.tests || [{}]).slice(-1)[0].group || "BeispielTest")}</code> trägt kein Tag <code>public</code> oder <code>hidden</code> auf Klassenebene.</p>`) };
        else if (outcome === "Start-Fehler") res = { status: "fail", msg: notice("danger", "x", "Referenzlösung startet nicht", "<p>GET /health hat innerhalb von 30 Sekunden nicht mit 200 geantwortet.</p>") };
        else {
          const all = (c.tests || []).flatMap(g => g.items), f = all[all.length - 1] || "Test";
          res = { status: "fail", msg: notice("danger", "x", `${all.length - 1} von ${all.length} Tests bestanden`, `<p>Fehlgeschlagen: <strong>${esc(f)}</strong>. Passe Testskript oder Referenzlösung an und prüfe erneut.</p>`) };
        }
        res.sig = refSig();
      }
      d.checks = Object.assign({}, d.checks, { [key]: res });
      save({ checks: d.checks }, true);
      renderChecks();
      CC.announce("Prüfung " + (res.status === "ok" ? "bestanden" : "fehlgeschlagen"));
    }, key === "libs" ? 1500 : 3500);
  }

  /* ---------- Freigabe ---------- */
  function requirements() {
    const r = [["Titel", !!(d.title || "").trim()], ["Aufgabenstellung", !!(d.taskMd || "").trim()]];
    if (d.format === "wert") r.push(["Erwarteter Wert", !!(d.expected || "").trim()]);
    else {
      r.push(["Starter-Code", !!(d.files || {}).starter], ["Testskript", !!(d.files || {}).testscript], ["Referenzlösung", !!(d.files || {}).reference]);
      r.push(["Libraries aufgelöst", checkState("libs", libsSig()).status === "ok"], ["Referenzlösung besteht alle Tests", checkState("ref", refSig()).status === "ok"]);
    }
    return r;
  }

  function renderRelease() {
    const req = requirements(), ready = req.every(x => x[1]);
    $("#release").innerHTML = `
      <h2 id="h-release">Freigabe</h2>
      <ul class="req-list" id="req-list">${req.map(([t, ok]) => `<li class="${ok ? "text-success" : "muted"}">${icon(ok ? "check" : "circle")}<span>${t}</span><span class="visually-hidden">${ok ? " – erfüllt" : " – fehlt noch"}</span></li>`).join("")}</ul>
      <p class="small muted">${released ? `Mit der Freigabe entsteht Version ${c.version + 1}. Bestehende Einreichungen bleiben unverändert.` : "Mit der Freigabe entsteht Version 1. Die Challenge bleibt privat, bis du sie öffentlich machst oder teilst."}</p>
      <div class="form-actions">
        <button class="btn btn-primary" type="button" data-release ${ready ? "" : 'disabled aria-describedby="req-list"'}>Freigeben</button>
        ${CC.hasChanges(c) ? `<a class="btn btn-outline" href="vorschau.html?id=${id}">Vorschau</a>` : ""}
      </div>
      <hr class="sep">
      <button class="btn btn-outline btn-sm danger-text" type="button" data-delete>${icon("trash")}${released ? "Änderungen verwerfen" : "Entwurf löschen"}</button>`;
    $("#head-release").disabled = !ready;
  }

  /* ---------- Seite aufbauen ---------- */
  function renderSolution() {
    $("#solution-slot").innerHTML = d.format === "wert" ? solutionWertHtml() : solutionCodeHtml();
    $("#toc-solution").innerHTML = d.format === "wert"
      ? '<li><a href="#s-solution">Lösung</a></li>'
      : '<li><a href="#s-solution">Lösung und Tests</a></li><li><a href="#s-libs">Library-Liste</a></li><li><a href="#s-checks">Prüfungen</a></li>';
    renderChecks();
  }

  function render() {
    document.title = `${d.title} bearbeiten – Coding Challenges`;
    const shown = released ? c.title : d.title;
    $("#crumbs").innerHTML = `<li><a href="meine-challenges.html">Meine Challenges</a></li><li><span aria-current="page">${esc(shown)}</span></li>`;
    $("#head").innerHTML = `<div class="page-head-main">
        <h1>${esc(shown)}</h1>
        <div class="head-badges">${CC.ownStateBadge(c)}${released ? ` <span class="small muted">Aktuell freigegeben: Version ${c.version}</span>` : ""}</div>
      </div>
      <div class="page-head-action"><button class="btn btn-primary" type="button" id="head-release" data-release>Freigeben</button></div>`;
    $("#subnav").innerHTML = CC.authorNav(c, "editor");
    let n = "";
    if (params.get("neu")) n += notice("info", "info", "Neuer Entwurf angelegt", "<p>Der Entwurf ist privat und wird automatisch gespeichert. Erst die Freigabe macht ihn für Löser nutzbar.</p>");
    if (released) n += notice("neutral", "info", "Du bearbeitest einen Entwurf",
      `<p>Löser sehen weiterhin Version ${c.version}, bis du die Änderungen freigibst. ${d.fresh ? "Noch keine Änderungen gegenüber der freigegebenen Version." : ""}</p>`);
    $("#notices").innerHTML = n;
    $("#form").innerHTML = metaHtml() + textHtml() + '<div id="solution-slot"></div>';
    renderSolution();
    renderRelease();
    $("#save-state").innerHTML = d.fresh ? "" : `${icon("check")}Entwurf gespeichert um ${CC.fmtTime(d.changedAt)} Uhr`;
  }

  /* ---------- Normalisierung für „Antwort testen“ ---------- */
  function normalize(v, opts) {
    let s = String(v).replace(/\r\n?/g, "\n");
    if (opts.includes("csv")) s = s.split("\n").map(l => l.split(",").map(x => x.trim()).join(",")).join("\n").replace(/^\n+|\n+$/g, "");
    if (opts.includes("trim")) s = s.trim();
    if (opts.includes("case")) s = s.toLowerCase();
    return s;
  }

  /* ---------- Ereignisse ---------- */
  document.addEventListener("input", e => {
    const f = e.target.closest("[data-field]");
    if (f) {
      let v = f.value;
      if (f.dataset.field === "limit") v = Math.max(1, Math.min(10, parseInt(v, 10) || 1));
      save({ [f.dataset.field]: v });
      if (f.dataset.field === "title") { /* Titel im Kopf erst nach Freigabe ändern; Seitentitel sofort */ document.title = `${v} bearbeiten – Coding Challenges`; }
    }
    const a = e.target.closest("[data-answer]");
    if (a) save({ answer: Object.assign({}, d.answer, { [a.dataset.answer]: a.value }) });
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "format") { save({ format: t.value }, true); renderSolution(); }
    if (t.matches("[data-answer-multi]")) save({ answer: Object.assign({}, d.answer, { type: t.checked ? "textarea" : "input" }) }, true);
    if (t.matches("[data-norm]")) {
      const set = new Set(d.normalization || []);
      t.checked ? set.add(t.dataset.norm) : set.delete(t.dataset.norm);
      save({ normalization: [...set] }, true);
    }
    if (t.matches("[data-file]") && t.files.length) {
      save({ files: Object.assign({}, d.files, { [t.dataset.file]: t.files[0].name }) }, true);
      renderSolution(); CC.toast(`„${t.files[0].name}“ hochgeladen`);
    }
    if (t.matches("[data-solver-files]") && t.files.length) {
      save({ solverFiles: (d.solverFiles || []).concat([...t.files].map(f => f.name)) }, true);
      renderSolution();
    }
  });
  document.addEventListener("submit", e => {
    if (e.target.id !== "lib-add") return;
    e.preventDefault();
    const inp = $("#f-coord"), err = $("#e-coord"), v = inp.value.trim();
    if (!/^[\w.-]+:[\w.-]+:[\w.-]+$/.test(v)) { inp.setAttribute("aria-invalid", "true"); err.hidden = false; inp.focus(); return; }
    save({ libraries: (d.libraries || []).concat([[v, $("#f-kind").value]]) }, true);
    renderSolution();
    $("#f-coord").focus();
  });
  document.addEventListener("click", async e => {
    const t = e.target;
    const mode = t.closest("[data-md-mode]");
    if (mode) {
      const box = mode.closest("[data-md]"), preview = mode.dataset.mdMode === "preview";
      box.querySelectorAll("[data-md-mode]").forEach(b => b.setAttribute("aria-pressed", String(b === mode)));
      const ta = box.querySelector("textarea"), pv = box.querySelector(".md-preview");
      pv.innerHTML = preview ? (CC.md(ta.value) || '<p class="muted">Nichts zum Anzeigen.</p>') : "";
      CC.addCopyButtons(pv);
      ta.hidden = preview; pv.hidden = !preview;
    }
    const rf = t.closest("[data-remove-file]");
    if (rf) { const l = (d.solverFiles || []).slice(); l.splice(+rf.dataset.removeFile, 1); save({ solverFiles: l }, true); renderSolution(); }
    const rl = t.closest("[data-remove-lib]");
    if (rl) { const l = (d.libraries || []).slice(); l.splice(+rl.dataset.removeLib, 1); save({ libraries: l }, true); renderSolution(); }
    const ck = t.closest("[data-check]");
    if (ck) runCheck(ck.dataset.check);
    if (t.closest("[data-try]")) {
      const v = $("#f-try").value;
      const ok = (d.expected || "") !== "" && normalize(v, d.normalization || []) === normalize(d.expected, d.normalization || []);
      $("#try-result").innerHTML = !d.expected
        ? notice("warning", "warning", null, "<p>Hinterlege zuerst einen erwarteten Wert.</p>")
        : ok ? notice("success", "check", null, "<p>Diese Antwort würde als <strong>richtig</strong> gewertet.</p>")
          : notice("danger", "x", null, "<p>Diese Antwort würde als <strong>falsch</strong> gewertet.</p>");
    }
    if (t.closest("[data-release]")) {
      const ok = await CC.confirmDialog({
        title: released ? `Version ${c.version + 1} freigeben?` : "Challenge freigeben?",
        body: (released
          ? `<p>Löser sehen ab sofort Version ${c.version + 1}. Bestehende Einreichungen und Lösungsstatus bleiben unverändert und werden nicht neu geprüft;
             wartende und laufende Prüfungen laufen gegen ihre Version zu Ende.</p>`
          : `<p>Es entsteht Version 1. Die Challenge bleibt <strong>privat</strong>; unter „Verwalten“ machst du sie öffentlich oder teilst sie per Link.</p>`)
          + (d.format === "code" ? "<p>Beim Freigeben lädt die Plattform die Libraries und baut das Testskript. Das kann einige Minuten dauern.</p>" : ""),
        confirmLabel: "Freigeben"
      });
      if (!ok) return;
      clearTimeout(saveTimer);
      CC.saveDraft(id, d);
      const v = CC.releaseDraft(id);
      location.href = `verwalten.html?id=${id}&freigegeben=${v}`;
    }
    if (t.closest("[data-delete]")) {
      const ok = await CC.confirmDialog({
        title: released ? "Änderungen verwerfen?" : "Entwurf löschen?",
        body: released ? `<p>Alle Änderungen im Entwurf gehen verloren. Löser sehen weiterhin Version ${c.version}.</p>`
          : `<p>„${esc(d.title)}“ wurde noch nie freigegeben und wird vollständig gelöscht.</p>`,
        confirmLabel: released ? "Änderungen verwerfen" : "Entwurf löschen",
        danger: true
      });
      if (!ok) return;
      clearTimeout(saveTimer);
      CC.deleteDraft(id);
      location.href = released ? `verwalten.html?id=${id}` : "meine-challenges.html";
    }
  });

  render();
})();
