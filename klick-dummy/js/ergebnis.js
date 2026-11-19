/* Seite: Ergebnis einer Source-Code-Einreichung mit Live-Prüfstatus */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { $, esc, icon, notice, params, isGuest } = CC;

  const id = params.get("id") || "url-shortener";
  const sha = params.get("sha");
  if (isGuest && id !== CC.guestChallengeId) { location.replace("ergebnis.html?id=" + CC.guestChallengeId); return; }
  let c = CC.getChallenge(id);
  if (c && c.format === "wert") { location.replace(`challenge.html?id=${id}#einreichen`); return; }
  const main = $("#main");
  if (!c) {
    main.innerHTML = `<div class="empty-state"><h1>Einreichung nicht gefunden</h1><p class="muted">Die Einreichung gibt es nicht oder du hast keinen Zugriff.</p>
      <a class="btn btn-primary" href="katalog.html">Zum Katalog</a></div>`;
    return;
  }

  /* Welche Einreichung wird gezeigt? Gelöschte (ersetzte/abgebrochene) leiten auf die aktuelle. */
  function resolve() {
    const out = { notices: "" };
    const current = () => (c.running ? "running" : c.submission ? "done" : "none");
    if (!sha) { out.mode = current(); return out; }
    if (c.running && c.running.sha === sha) { out.mode = "running"; return out; }
    if (c.submission && c.submission.sha === sha) { out.mode = "done"; return out; }
    if (c.aborted && c.aborted.sha === sha) {
      out.notices = notice("danger", "lock", "Prüfung abgebrochen",
        `<p>Die Prüfung von Commit <code>${esc(sha)}</code> wurde abgebrochen, weil die Challenge gesperrt wurde. Die Einreichung wurde gelöscht,
         dein Lösungsstatus bleibt unverändert.</p>`);
      out.mode = current();
      return out;
    }
    const rep = (c.replaced || []).find(r => r.sha === sha);
    out.notices = rep
      ? notice("info", "info", "Neuere Einreichung vorhanden",
        `<p>Die Einreichung zu Commit <code>${esc(sha)}</code> wurde durch eine neuere ersetzt und gelöscht. Angezeigt wird deine aktuelle Einreichung.</p>`)
      : notice("neutral", "info", "Einreichung nicht mehr vorhanden", "<p>Angezeigt wird deine aktuelle Einreichung zu dieser Challenge.</p>");
    out.mode = current();
    return out;
  }

  function groupHtml(g, state) {
    const pub = g.visibility === "öffentlich";
    const passed = g.tests.filter(t => t.status === "passed").length;
    let summary;
    if (state === "waiting") summary = CC.testStatus("waiting");
    else if (state === "running") summary = CC.testStatus("running");
    else if (g.startError) summary = CC.testStatus("error");
    else if (g.tests.every(t => t.status === "skipped")) summary = CC.testStatus("skipped");
    else summary = `<span class="group-count ${passed === g.tests.length ? "text-success" : "text-danger"}">${passed} von ${g.tests.length} bestanden</span>`;
    const hasFail = state === "done" && (g.startError || g.tests.some(t => t.status === "failed"));
    const tests = g.tests.map(t => {
      const st = state === "done" ? t.status : state;
      const detail = pub && st === "failed" && t.request ? `
        <details class="test-detail"><summary>Details anzeigen</summary>
          <div class="detail-grid">
            <div><h4>Request</h4><pre>${esc(t.request)}</pre></div>
            <div><h4>Erwartet</h4><pre>${esc(t.expected)}</pre></div>
            <div><h4>Tatsächlich</h4><pre>${esc(t.actual)}</pre></div>
            <div class="full"><h4>Assertion</h4><pre>${esc(t.assertion)}</pre></div>
          </div>
        </details>` : "";
      return `<li><div class="test-row">${CC.testStatus(st)}<span class="test-name">${esc(t.name)}</span></div>${detail}</li>`;
    }).join("");
    return `<details class="test-group" ${hasFail ? "open" : ""}>
      <summary>
        <span class="group-title">${pub ? "" : icon("lock")}<strong>${esc(g.name)}</strong><span class="tag">${pub ? "öffentlich" : "versteckt"}</span></span>
        ${summary}
      </summary>
      <div class="group-body">
        ${state === "done" && g.startError ? notice("warning", "warning", "Service-Start fehlgeschlagen", `<p>${esc(g.startError)}</p>`) : ""}
        <ul class="test-list">${tests}</ul>
        ${pub
          ? (state === "done" && g.log ? `<details class="log"><summary>Service-Log (gekürzt)</summary><pre>${esc(g.log)}</pre></details>` : "")
          : `<p class="small muted" style="margin:var(--space-3) 0 0">Versteckte Testgruppe: Du siehst nur Name und Status der Tests. Ein Service-Log wird nicht gespeichert.</p>`}
      </div>
    </details>`;
  }

  function render() {
    c = CC.getChallenge(id);
    const v = resolve();
    const cur = v.mode === "running" ? c.running : v.mode === "done" ? c.submission : null;
    document.title = `${cur ? "Einreichung " + cur.sha : "Ergebnis"} – ${c.title} – Coding Challenges`;

    $("#crumbs").innerHTML = `${isGuest ? "" : '<li><a href="katalog.html">Challenges</a></li>'}
      <li><a href="challenge.html?id=${c.id}">${esc(c.title)}</a></li>
      <li><span aria-current="page">${cur ? "Einreichung " + esc(cur.sha) : "Ergebnis"}</span></li>`;
    $("#head").innerHTML = `<div class="page-head-main">
        <h1>${cur ? `Einreichung <span class="mono">${esc(cur.sha)}</span>` : "Noch keine Einreichung"}</h1>
        <p class="lead">zu <a href="challenge.html?id=${c.id}">${esc(c.title)}</a></p>
      </div>
      <div class="page-head-action"><a class="btn btn-outline" href="challenge.html?id=${c.id}#einreichen">${icon("arrowLeft")}Zur Challenge</a></div>`;

    let n = v.notices;
    if (v.mode === "done" && c.submission.version < c.version) {
      n += notice("neutral", "info", "Frühere Version", `<p>Diese Einreichung gehört zu Version ${c.submission.version} der Challenge. Aktuell ist Version ${c.version}; die Einreichung wurde nicht neu geprüft.</p>`);
    }
    $("#notices").innerHTML = n;

    if (v.mode === "none") {
      $("#result").innerHTML = `<div class="card empty-state"><h2>Keine Einreichung</h2><p class="muted">Du hast zu dieser Challenge noch nichts eingereicht.</p>
        <a class="btn btn-primary" href="challenge.html?id=${c.id}#einreichen">So reichst du ein</a></div>`;
      return;
    }

    let report, overview, live = null;
    if (v.mode === "running") {
      live = CC.liveState(c);
      report = CC.buildResult(c, c.running.outcome);
      overview = `<div class="result-head">${CC.runningPill(live.step)}</div>
        <dl class="sub-dl">
          <dt>Commit</dt><dd><code>${esc(c.running.sha)}</code></dd>
          <dt>Eingereicht</dt><dd>${CC.fmtDateTime(c.running.at)}</dd>
          <dt>Version</dt><dd>${c.version}</dd>
        </dl>
        ${CC.stepper(live.step)}
        <p class="small muted" style="margin:0">Die Seite aktualisiert sich automatisch. Du kannst sie auch schließen; das Ergebnis findest du später hier.</p>`;
    } else {
      const s = c.submission;
      report = s.report;
      const failedAt = s.cause === "Build-Fehler" ? "building" : s.cause === "Start-Fehler" ? "testing" : null;
      let summary;
      if (s.result === "bestanden") summary = notice("success", "check", "Alle Tests bestanden", "<p>Die Challenge ist gelöst.</p>");
      else if (s.result === "nicht bestanden") summary = notice("danger", "x", `${s.passed} von ${s.total} Tests bestanden`, "<p>Mindestens ein Test ist fehlgeschlagen. Details zu öffentlichen Tests findest du unten.</p>");
      else if (s.cause === "Build-Fehler") summary = notice("warning", "warning", "Build fehlgeschlagen", `<p>${report.buildHint} Es wurden keine Tests ausgeführt.</p>`);
      else summary = notice("warning", "warning", "Service-Start fehlgeschlagen", "<p>Dein Service hat den Health-Check nicht bestanden. Es wurden keine Tests ausgeführt.</p>");
      overview = `<div class="result-head">${CC.resultPill(s.result, s.cause)}</div>
        <dl class="sub-dl">
          <dt>Commit</dt><dd><code>${esc(s.sha)}</code></dd>
          <dt>Eingereicht</dt><dd>${CC.fmtDateTime(s.at)}</dd>
          <dt>Version</dt><dd>${s.version}</dd>
          ${s.cause === "Build-Fehler" ? "" : `<dt>Tests</dt><dd>${s.passed} von ${s.total} bestanden</dd>`}
        </dl>
        ${CC.stepper("done", failedAt)}
        ${summary}`;
    }

    const groups = report.groups.map((g, i) => {
      if (!live) return groupHtml(g, "done");
      if (live.step !== "testing" || i > live.groupsDone) return groupHtml(g, "waiting");
      return groupHtml(g, i < live.groupsDone ? "done" : "running");
    }).join("");
    const buildDone = !live || live.step === "testing";
    const buildLog = buildDone
      ? `<details class="log" ${report.buildOk ? "" : "open"}><summary>Build-Log (gekürzt)</summary><pre>${esc(report.buildLog)}</pre></details>`
      : `<p class="muted">Das Build-Log erscheint, sobald der Build abgeschlossen ist.</p>`;

    $("#result").innerHTML = `
      <section class="card" aria-labelledby="h-overview"><h2 id="h-overview" class="visually-hidden">Überblick</h2>${overview}</section>
      <section class="card" aria-labelledby="h-tests">
        <h2 id="h-tests">Tests</h2>
        <p class="small muted">Jede Testgruppe läuft gegen eine eigene, frische Instanz deines Service.</p>
        <div class="test-groups">${groups}</div>
      </section>
      <section class="card" aria-labelledby="h-build"><h2 id="h-build">Build</h2>${buildLog}</section>`;
  }

  /* Live-Aktualisierung: neu zeichnen, wenn sich Schritt oder Gruppe ändert */
  let lastKey = "";
  const keyOf = () => (c.running ? (s => s.step + s.groupsDone)(CC.liveState(c)) : "fertig");
  render();
  lastKey = keyOf();
  const runningSha = c.running && c.running.sha;
  if (c.running) {
    const timer = setInterval(() => {
      c = CC.getChallenge(id);
      const k = keyOf();
      if (k === lastKey) return;
      lastKey = k;
      const openDetails = [...document.querySelectorAll("details[open] > summary")].map(s => s.textContent.trim());
      render();
      document.querySelectorAll("details > summary").forEach(s => { if (openDetails.includes(s.textContent.trim())) s.parentElement.open = true; });
      if (!c.running) {
        clearInterval(timer);
        const s = c.submission;
        CC.announce(s && s.sha === runningSha ? `Prüfung abgeschlossen: ${s.result === "Fehler" ? s.cause : s.result}` : "Prüfung abgebrochen");
      } else {
        const st = CC.liveState(c);
        CC.announce("Prüfstatus: " + CC.STEPS.find(x => x[0] === st.step)[1]);
      }
    }, 1000);
  }
})();
