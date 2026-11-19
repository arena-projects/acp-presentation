/* Seite: Challenge-Detail mit Tabs und Einreichen (Wert-Formular bzw. simulierter git push) */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { D, $, esc, icon, notice, store, isGuest, params } = CC;

  const id = params.get("id") || "huge-sudoku";
  if (isGuest && id !== CC.guestChallengeId) { location.replace("challenge.html?id=" + CC.guestChallengeId); return; }
  let c = CC.getChallenge(id);
  const main = $("#main");
  /* Vorschau (Autor): Challenge mit den Daten des Entwurfs, ohne eigene Einreichungen (V-7) */
  const preview = CC.page === "vorschau";
  if (c && preview) {
    if (!c.owner) c = null;
    else if (!CC.hasChanges(c)) { location.replace("challenge.html?id=" + id); return; }
    else {
      const d = CC.getDraft(id);
      if (d) c = Object.assign({}, c, d, { task: CC.md(d.taskMd), tips: CC.md(d.tipsMd) });
      c = Object.assign({}, c, { status: { kind: "offen" }, submission: null, running: null, aborted: null, state: c.state === "entwurf" ? "freigegeben" : c.state, hasDraft: !!d });
    }
  } else if (c && (c.state === "entwurf" || (c.visibility === "privat" && !c.shared && !c.owner))) c = null;
  if (!c) {
    main.innerHTML = `<div class="empty-state"><h1>Challenge nicht gefunden</h1><p class="muted">Die Challenge gibt es nicht oder du hast keinen Zugriff.</p>
      <a class="btn btn-primary" href="katalog.html">Zum Katalog</a></div>`;
    return;
  }
  document.title = `${c.title} – Coding Challenges`;
  const isBlocked = () => preview || c.state === "gesperrt" || c.state === "archiviert";
  const resultUrl = sha => `ergebnis.html?id=${c.id}${sha ? "&sha=" + sha : ""}`;
  const STEP_TEXT = { queued: "wartet auf einen freien Prüfplatz", building: "wird gerade gebaut", testing: "wird gerade getestet" };

  const tabs = [["aufgabe", "Aufgabe"], ["tipps", "Tipps"]];
  if (c.format === "code") tabs.push(["tests", "Tests"], ["libraries", "Libraries"]);
  tabs.push(["einreichen", "Einreichen"]);

  /* ---------- Kopf und Hinweisleiste ---------- */
  function renderHead() {
    $("#crumbs").innerHTML = preview
      ? `<li><a href="meine-challenges.html">Meine Challenges</a></li><li><a href="editor.html?id=${c.id}">${esc(c.title)}</a></li><li><span aria-current="page">Vorschau</span></li>`
      : isGuest
      ? `<li><span aria-current="page">${esc(c.title)}</span></li>`
      : `<li><a href="katalog.html">Challenges</a></li><li><span aria-current="page">${esc(c.title)}</span></li>`;
    $("#head").innerHTML = `
      <div class="page-head-main">
        <h1>${esc(c.title)}</h1>
        <p class="lead">${esc(c.summary)}</p>
        <div style="margin-top:var(--space-3)">${CC.tagsHtml(c)}</div>
        <dl class="meta">
          <div><dt>Autor</dt><dd>${esc(c.author)}</dd></div>
          <div><dt>Version</dt><dd>${c.version}</dd></div>
          <div><dt>Dein Status</dt><dd>${CC.statusPill(c)}</dd></div>
        </dl>
      </div>
      ${isBlocked() || preview ? "" : `<div class="page-head-action"><a class="btn btn-primary" href="#einreichen" data-goto-tab="einreichen">Lösung einreichen</a></div>`}`;

    let n = "";
    if (preview) {
      $("#subnav").innerHTML = CC.authorNav(CC.getChallenge(id), "vorschau");
      n += notice("info", "info", "Vorschau des Entwurfs",
        `<p>So sehen Löser die Challenge nach der Freigabe. Einreichen ist in der Vorschau nicht möglich.
         <a href="editor.html?id=${c.id}">Zurück zum Editor</a></p>`);
    }
    if (c.state === "gesperrt") {
      n += notice("danger", "lock", "Challenge gesperrt", `<p>Diese Challenge wurde von der Administration gesperrt. Einreichungen sind derzeit nicht möglich.</p>
        ${c.aborted ? `<p>Deine laufende Prüfung (Commit <code>${esc(c.aborted.sha)}</code>) wurde deshalb abgebrochen und gelöscht. Dein Lösungsstatus bleibt unverändert.</p>` : ""}`);
    }
    if (c.state === "archiviert") n += notice("warning", "archive", "Challenge archiviert", "<p>Neue Einreichungen sind nicht mehr möglich. Deine bisherigen Ergebnisse bleiben sichtbar.</p>");
    if (c.running) {
      const st = CC.liveState(c);
      n += notice("info", "clock", "Prüfung läuft",
        `<p>Deine Einreichung (Commit <code>${esc(c.running.sha)}</code>, ${CC.fmtTime(c.running.at)} Uhr) ${STEP_TEXT[st.step]}.
         <a href="${resultUrl(c.running.sha)}">Zum Prüfstatus</a></p>`);
    }
    $("#notices").innerHTML = n;
  }

  /* ---------- Tabs ---------- */
  function renderTabs() {
    $("#tabs").innerHTML = `
      <div class="tablist" role="tablist" aria-label="Bereiche der Challenge">
        ${tabs.map(([k, t]) => `<button class="tab" role="tab" type="button" id="tab-${k}" aria-controls="panel-${k}" aria-selected="false" tabindex="-1">${t}</button>`).join("")}
      </div>
      ${tabs.map(([k]) => `<section class="tabpanel" role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}" tabindex="0" hidden></section>`).join("")}`;
    $("#panel-aufgabe").innerHTML = `<div class="prose">${CC.withIcons(c.task)}</div>`;
    $("#panel-tipps").innerHTML = `<div class="prose">${CC.withIcons(c.tips)}</div>`;
    if (c.format === "code") { renderTests(); renderLibraries(); }
    renderSubmit();
    CC.addCopyButtons($("#tabs"));
  }

  function selectTab(key, focus) {
    if (!tabs.some(([k]) => k === key)) key = "aufgabe";
    tabs.forEach(([k]) => {
      const t = $("#tab-" + k), p = $("#panel-" + k), on = k === key;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      p.hidden = !on;
    });
    if (focus) $("#tab-" + key).focus();
    history.replaceState(null, "", location.search + "#" + key);
  }

  function wireTabs() {
    $("#tabs").addEventListener("click", e => {
      const t = e.target.closest('[role="tab"]');
      if (t) selectTab(t.id.slice(4));
    });
    $("#tabs").addEventListener("keydown", e => {
      const t = e.target.closest('[role="tab"]');
      if (!t) return;
      const keys = tabs.map(([k]) => k);
      let i = keys.indexOf(t.id.slice(4));
      if (e.key === "ArrowRight") i = (i + 1) % keys.length;
      else if (e.key === "ArrowLeft") i = (i - 1 + keys.length) % keys.length;
      else if (e.key === "Home") i = 0;
      else if (e.key === "End") i = keys.length - 1;
      else return;
      e.preventDefault();
      selectTab(keys[i], true);
    });
    document.addEventListener("click", e => {
      const g = e.target.closest("[data-goto-tab]");
      if (g) { e.preventDefault(); selectTab(g.dataset.gotoTab); $("#tab-" + g.dataset.gotoTab).scrollIntoView({ block: "start" }); $("#tab-" + g.dataset.gotoTab).focus(); }
    });
    window.addEventListener("hashchange", () => selectTab(location.hash.slice(1)));
  }

  function renderTests() {
    const groups = c.tests.map(g => g.visibility === "versteckt"
      ? `<div class="card"><h3>${icon("lock")} ${esc(g.group)} <span class="tag">versteckt</span></h3>
           <p class="muted" style="margin:0">${g.items.length} Tests. Nach einer Einreichung siehst du von versteckten Tests nur Name und Status.</p></div>`
      : `<div class="card"><h3>${esc(g.group)} <span class="tag">öffentlich</span></h3>
           <ul style="margin:0">${g.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");
    $("#panel-tests").innerHTML = `<div class="prose"><p>Jede Testgruppe läuft gegen eine frische Instanz deines Service. Für öffentliche Tests
      siehst du nach der Prüfung Request, erwartete und tatsächliche Response.</p></div>${groups}`;
  }

  function renderLibraries() {
    $("#panel-libraries").innerHTML = `<div class="prose">
      <p>Dein Build läuft offline. Erlaubt sind nur diese Libraries und Plugins (inklusive ihrer Abhängigkeiten).
      Andere führen zu einem Build-Fehler. <a href="hilfe.html#libraries">Mehr dazu in der Hilfe</a>.</p></div>
      <div class="card" style="padding:0;overflow-x:auto">
      <table class="lib-table"><caption class="visually-hidden">Erlaubte Libraries und Plugins</caption>
        <thead><tr><th scope="col">Maven-Koordinaten</th><th scope="col">Art</th></tr></thead>
        <tbody>${c.libraries.map(([coord, kind]) => `<tr><td>${esc(coord)}</td><td>${kind}</td></tr>`).join("")}</tbody>
      </table></div>`;
  }

  /* ---------- Einreichen ---------- */
  function shortValue(v) {
    const lines = String(v).split(/\r?\n/).filter(l => l.trim() !== "");
    return lines.length > 1
      ? `<code>${esc(lines[0].slice(0, 40))}${lines[0].length > 40 ? "…" : ""}</code> <span class="muted">(${lines.length} Zeilen)</span>`
      : `<code>${esc(v.length > 60 ? v.slice(0, 60) + "…" : v)}</code>`;
  }

  function submissionHtml() {
    let h = "";
    if (c.running) {
      const st = CC.liveState(c);
      h += `<h2>Offene Einreichung</h2>
        <dl class="sub-dl">
          <dt>Status</dt><dd>${CC.runningPill(st.step)}</dd>
          <dt>Eingereicht</dt><dd>${CC.fmtDateTime(c.running.at)}</dd>
          <dt>Commit</dt><dd><code>${esc(c.running.sha)}</code></dd>
        </dl>
        <p><a href="${resultUrl(c.running.sha)}">Prüfstatus live verfolgen</a></p>`;
    }
    const s = c.submission;
    if (!s) {
      return h || `<h2>Deine Einreichung</h2><p class="muted" style="margin:0">Noch keine Einreichung. Sobald du eine Lösung einreichst, siehst du hier das Ergebnis.</p>`;
    }
    const old = s.version < c.version
      ? notice("neutral", "info", null, `<p>Diese Einreichung gehört zu <strong>Version ${s.version}</strong>. Aktuell ist Version ${c.version}; deine Einreichung wurde nicht neu geprüft.</p>`)
      : "";
    return h + `<h2>${c.running ? "Letzte abgeschlossene Einreichung" : "Deine Einreichung"}</h2>
      <dl class="sub-dl">
        <dt>Ergebnis</dt><dd>${CC.resultPill(s.result, s.cause)}${s.total ? ` <span class="muted small">${s.passed} von ${s.total} Tests bestanden</span>` : ""}</dd>
        <dt>Eingereicht</dt><dd>${CC.fmtDateTime(s.at)}</dd>
        ${c.format === "wert" ? `<dt>Wert</dt><dd>${shortValue(s.value)}</dd>` : `<dt>Commit</dt><dd><code>${esc(s.sha)}</code></dd>`}
        <dt>Version</dt><dd>${s.version}</dd>
      </dl>
      ${old}
      ${c.format === "code" ? `<a href="${resultUrl(s.sha)}">Alle Details auf der Ergebnisseite</a>` : ""}`;
  }

  function blockedNote() {
    if (preview) return notice("info", "info", "Vorschau", "<p>In der Vorschau kannst du nichts einreichen. Löser sehen hier das Formular.</p>");
    return c.state === "gesperrt"
      ? notice("danger", "lock", "Einreichen nicht möglich", "<p>Die Challenge ist gesperrt.</p>")
      : notice("warning", "archive", "Einreichen nicht möglich", "<p>Die Challenge ist archiviert.</p>");
  }

  function valueFormHtml() {
    const a = c.answer, blocked = isBlocked();
    const field = a.type === "textarea"
      ? `<textarea class="textarea" id="answer" name="answer" rows="10" spellcheck="false" aria-describedby="answer-hint answer-error" ${blocked ? "disabled" : ""}></textarea>`
      : `<input class="input" id="answer" name="answer" type="text" ${a.inputmode ? `inputmode="${a.inputmode}"` : ""} autocomplete="off" aria-describedby="answer-hint answer-error" ${blocked ? "disabled" : ""}>`;
    return `<div class="card">
      <h2>Antwort einreichen</h2>
      ${blocked ? blockedNote() : ""}
      <form id="value-form" novalidate>
        <div class="field">
          <label for="answer">${esc(a.label)}</label>
          ${field}
          <span class="hint" id="answer-hint">${esc(a.hint)}</span>
          <span class="error" id="answer-error" hidden>${icon("warning")}<span>Bitte gib eine Antwort ein.</span></span>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" ${blocked ? "disabled" : ""}>Prüfen</button></div>
      </form>
      <div id="value-result" aria-live="polite" style="margin-top:var(--space-4)"></div>
    </div>`;
  }

  function pushFormHtml() {
    const url = `https://${D.host}/challenges/${c.id}.git`, blocked = isBlocked();
    return `<div class="card">
      <h2>Lösung per <code>git push</code> einreichen</h2>
      ${blocked ? blockedNote() : ""}
      <ol class="steps">
        <li><h3>Starter-Code herunterladen</h3>
          <p>Ein Maven-Projekt mit passender <code>pom.xml</code>, Health-Check und den Libraries dieser Challenge.</p>
          <button class="btn btn-outline" type="button" data-fake-download>${icon("download")}Starter-Code (zip)</button></li>
        <li><h3>Push-Token erzeugen</h3>
          <p>Git fragt beim ersten Push nach Benutzername und Passwort. Als Passwort gibst du dein Push-Token ein.</p>
          <a class="btn btn-outline" href="token.html">${icon("key")}Zum Push-Token</a></li>
        <li><h3>Remote hinzufügen</h3>
          <div class="code-block"><pre><code>git remote add submit ${url}</code></pre></div></li>
        <li><h3>Pushen</h3>
          <div class="code-block"><pre><code>git push submit main</code></pre></div>
          <p class="small muted">Git bestätigt die Einreichung mit dem Commit und nennt den Link zur Ergebnisseite. Jeder Push ersetzt eine noch laufende Prüfung dieser Challenge.</p>
          ${blocked ? "" : `<button class="btn btn-secondary" type="button" data-push>${icon("git")}Push simulieren</button>`}
          <div id="push-output" aria-live="polite"></div>
        </li>
      </ol>
    </div>`;
  }

  function renderSubmit() {
    $("#panel-einreichen").innerHTML = `<div class="two-col">${c.format === "wert" ? valueFormHtml() : pushFormHtml()}
      <div class="card" id="submission">${submissionHtml()}</div></div>`;
    const vf = $("#value-form");
    if (vf) vf.addEventListener("submit", onValueSubmit);
  }

  let wasBlocked = isBlocked();
  function refresh() {
    renderHead();
    if (isBlocked() !== wasBlocked) { wasBlocked = isBlocked(); renderSubmit(); CC.addCopyButtons($("#panel-einreichen")); }
    else $("#submission").innerHTML = submissionHtml();
  }

  function onValueSubmit(e) {
    e.preventDefault();
    const input = $("#answer"), err = $("#answer-error"), out = $("#value-result");
    const value = input.value.trim();
    if (!value) { input.setAttribute("aria-invalid", "true"); err.hidden = false; input.focus(); return; }
    input.removeAttribute("aria-invalid"); err.hidden = true;
    const q = CC.quota(c);
    if (q.left === 0) {
      out.innerHTML = notice("warning", "clock", "Einreichungs-Limit erreicht",
        `<p>Bei dieser Challenge sind ${c.limit} Einreichungen pro 15 Minuten möglich. Deine nächste Einreichung ist ab
         <strong>${CC.fmtTime(q.next)} Uhr</strong> möglich. Deine Antwort bleibt im Feld stehen.</p>`);
      return;
    }
    if (isGuest && CC.guestLinkLeft() === 0) {
      out.innerHTML = notice("warning", "clock", "Limit des Teilen-Links erreicht",
        `<p>Alle Gäste dieses Links zusammen haben ihr Limit für die letzten 15 Minuten ausgeschöpft. Dein eigenes Limit ist nicht erreicht.
         Nächste Einreichung voraussichtlich ab <strong>${CC.fmtTime(Date.now() + 15 * 60 * 1000)} Uhr</strong>.</p>`);
      return;
    }
    CC.useQuota(c);
    const result = store.get("outcome", "nicht bestanden") === "bestanden" ? "bestanden" : "nicht bestanden";
    const sub = { at: new Date().toISOString(), value, version: c.version, result };
    CC.saveChallenge(c.id, { submission: sub, status: result === "bestanden" ? { kind: "geloest" } : { kind: "nicht-geloest", cause: "nicht bestanden" } });
    c = CC.getChallenge(id);
    out.innerHTML = result === "bestanden"
      ? notice("success", "check", "Bestanden", "<p>Deine Antwort ist richtig. Die Challenge ist gelöst.</p>")
      : notice("danger", "x", "Nicht bestanden", "<p>Deine Antwort stimmt nicht. Prüfe deinen Lösungsweg und versuche es erneut.</p>");
    if (result === "bestanden") input.value = "";
    refresh();
  }

  function onPush() {
    c = CC.getChallenge(id);
    const remote = `https://${D.host}/challenges/${c.id}.git`;
    let lines = `$ git push submit main
Enumerating objects: 23, done.
Writing objects: 100% (23/23), 4.12 KiB | 4.12 MiB/s, done.
Total 23 (delta 4), reused 0 (delta 0)
`;
    const q = CC.quota(c);
    const reject = (msg, reason) => {
      lines += msg + `To ${remote}\n ! [remote rejected] main -> main (${reason})\nerror: failed to push some refs to '${remote}'`;
      $("#push-output").innerHTML = `<div class="code-block terminal no-copy"><pre><code>${esc(lines)}</code></pre></div>`;
    };
    if (q.left === 0) {
      return reject(`remote: Abgelehnt: Einreichungs-Limit erreicht (${c.limit} pro 15 Minuten).\nremote: Nächste Einreichung ab ${CC.fmtTime(q.next)} Uhr möglich.\n`, "Einreichungs-Limit erreicht");
    }
    if (isGuest && CC.guestLinkLeft() === 0) {
      return reject(`remote: Abgelehnt: Das gemeinsame Limit aller Gäste dieses Teilen-Links ist erreicht.\nremote: Dein eigenes Limit ist nicht erreicht. Versuche es in einigen Minuten erneut.\n`, "Link-Limit erreicht");
    }
    CC.useQuota(c);
    const sha = CC.randomHex(7), prev = c.running, now = Date.now();
    const replaced = (c.replaced || []).slice();
    if (prev) replaced.push({ sha: prev.sha, by: sha });
    CC.saveChallenge(c.id, { replaced, running: { sha, at: new Date(now).toISOString(), startedAt: now, outcome: store.get("outcome", "nicht bestanden") } });
    lines += `remote: Einreichung angenommen (Commit ${sha})
${prev ? `remote: Die laufende Prüfung von Commit ${prev.sha} wurde abgebrochen und gelöscht.\n` : ""}remote: Ergebnis: https://${D.host}/submissions/${4712 + replaced.length}
To ${remote}
 * [new branch]      main -> main`;
    $("#push-output").innerHTML = `<div class="code-block terminal no-copy"><pre><code>${esc(lines)}</code></pre></div>
      <a class="btn btn-primary" href="${resultUrl(sha)}">Zur Ergebnisseite</a>`;
    $("#push-output").scrollIntoView({ block: "nearest" });
    c = CC.getChallenge(id);
    refresh();
    startLive();
  }

  /* ---------- Live-Aktualisierung während einer Prüfung ---------- */
  let timer = null, lastKey = "";
  function startLive() {
    if (timer) return;
    timer = setInterval(() => {
      c = CC.getChallenge(id);
      const key = c.running ? CC.liveState(c).step : "fertig";
      if (key !== lastKey) { lastKey = key; refresh(); }
      if (!c.running) { clearInterval(timer); timer = null; }
    }, 1000);
  }

  document.addEventListener("click", e => { if (e.target.closest("[data-push]")) onPush(); });

  renderHead();
  renderTabs();
  wireTabs();
  selectTab(location.hash.slice(1) || "aufgabe");
  if (c.running) startLive();
})();
