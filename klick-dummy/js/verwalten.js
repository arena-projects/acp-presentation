/* Seite: Challenge verwalten (Autor) – Sichtbarkeit, Teilen-Links, Archivieren */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { D, $, esc, icon, notice, params } = CC;

  const id = params.get("id");
  let c = CC.getChallenge(id);
  if (!c || !c.owner) { location.replace("meine-challenges.html"); return; }
  if (c.state === "entwurf") { location.replace("editor.html?id=" + id); return; }

  const DAY = 86400000;
  const linkUrl = l => `https://${D.host}/teilen/${l.code}`;
  const daysLeft = l => Math.ceil((new Date(l.expires) - Date.now()) / DAY);
  const randomCode = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"[Math.floor(Math.random() * 57)]).join("");

  function render(flash) {
    c = CC.getChallenge(id);
    const d = CC.getDraft(id);
    document.title = `${c.title} verwalten – Coding Challenges`;
    $("#crumbs").innerHTML = `<li><a href="meine-challenges.html">Meine Challenges</a></li><li><span aria-current="page">${esc(c.title)}</span></li>`;
    $("#head").innerHTML = `<div class="page-head-main"><h1>${esc(c.title)}</h1><div class="head-badges">${CC.ownStateBadge(c)}</div></div>`;
    $("#subnav").innerHTML = CC.authorNav(c, "verwalten");

    let n = flash || "";
    const rel = params.get("freigegeben");
    if (rel && !flash) n += notice("success", "check", `Version ${esc(rel)} freigegeben`,
      rel === "1" && c.visibility === "privat" ? "<p>Die Challenge ist noch privat. Mach sie unten öffentlich oder teile sie per Link.</p>" : "<p>Löser sehen ab sofort die neue Version.</p>");
    if (c.state === "archiviert") n += notice("warning", "archive", "Challenge archiviert", "<p>Neue Einreichungen werden abgelehnt. Ergebnisse bleiben für Löser sichtbar.</p>");
    if (c.state === "gesperrt") n += notice("danger", "lock", "Von der Administration gesperrt", "<p>Einreichungen sind nicht möglich. Wende dich an die Administration, um die Sperre klären zu lassen.</p>");
    $("#notices").innerHTML = n;

    $("#overview").innerHTML = `<h2 id="h-overview">Überblick</h2>
      <dl class="sub-dl">
        <dt>Format</dt><dd><span class="tag">${c.format === "wert" ? "Wert" : "Code"}</span></dd>
        <dt>Aktuelle Version</dt><dd>Version ${c.version}${c.releasedAt ? `, freigegeben am ${CC.fmtDate(c.releasedAt)}` : ""} – <a href="challenge.html?id=${id}">ansehen</a></dd>
        <dt>Entwurf</dt><dd>${d && !d.fresh ? `Änderungen vom ${CC.fmtDateTime(d.changedAt)} – <a href="editor.html?id=${id}">weiter bearbeiten</a> · <a href="vorschau.html?id=${id}">Vorschau</a>` : c.state === "archiviert" ? "–" : `keiner – <a href="editor.html?id=${id}">Änderungen beginnen</a>`}</dd>
        <dt>Sichtbarkeit</dt><dd>${c.visibility === "öffentlich" ? "Öffentlich" : "Privat"}</dd>
      </dl>`;

    $("#visibility").innerHTML = `<h2 id="h-vis">Sichtbarkeit</h2>
      <form id="vis-form">
        <fieldset class="field" style="margin-bottom:var(--space-4)">
          <legend class="visually-hidden">Sichtbarkeit</legend>
          <label class="role-option"><input type="radio" name="vis" value="privat" ${c.visibility === "privat" ? "checked" : ""}>
            <span><strong>Privat</strong><span class="small muted">Nur du siehst die Challenge. Über Teilen-Links erhalten Gäste und Nutzer trotzdem Zugriff.</span></span></label>
          <label class="role-option"><input type="radio" name="vis" value="öffentlich" ${c.visibility === "öffentlich" ? "checked" : ""}>
            <span><strong>Öffentlich</strong><span class="small muted">Alle angemeldeten Nutzer finden die Challenge im Katalog.</span></span></label>
        </fieldset>
        <button class="btn btn-outline" type="submit">Sichtbarkeit speichern</button>
      </form>`;

    const links = CC.shareLinks(c);
    $("#links").innerHTML = `<h2 id="h-links">Teilen-Links</h2>
      <p class="muted small">Über einen Teilen-Link lösen Gäste genau diese Challenge ohne Anmeldung. Jeder Browser erhält eine eigene Gast-Identität.
        Ein Link ist 30 Tage gültig und lässt sich vor Ablauf verlängern. Läuft er ab oder widerrufst du ihn, werden alle Daten seiner Gäste gelöscht.</p>
      ${links.length ? `<div class="table-card" style="overflow-x:auto"><table class="data-table links-table">
        <caption class="visually-hidden">Teilen-Links</caption>
        <thead><tr><th scope="col">Bezeichnung</th><th scope="col">Link</th><th scope="col">Gültig bis</th><th scope="col">Gäste</th><th scope="col"><span class="visually-hidden">Aktionen</span></th></tr></thead>
        <tbody>${links.map(l => {
          const left = daysLeft(l);
          return `<tr>
            <th scope="row" data-label="Bezeichnung">${l.label ? esc(l.label) : '<span class="muted">Ohne Bezeichnung</span>'}<br><span class="small muted">erstellt am ${CC.fmtDate(l.created)}</span></th>
            <td data-label="Link"><code class="link-code" title="${esc(linkUrl(l))}">…/teilen/${esc(l.code)}</code>
              <button class="btn btn-outline btn-sm" type="button" data-copy-link="${l.id}">${icon("copy")}Kopieren<span class="visually-hidden">: ${esc(l.label || "Link")}</span></button></td>
            <td data-label="Gültig bis">${CC.fmtDate(l.expires)}<br><span class="small ${left <= 7 ? "text-warning" : "muted"}">${left <= 7 ? icon("clock") + " " : ""}noch ${left} Tag${left === 1 ? "" : "e"}</span></td>
            <td data-label="Gäste">${l.guests}</td>
            <td class="row-actions">
              <button class="btn btn-outline btn-sm" type="button" data-extend="${l.id}">Verlängern<span class="visually-hidden">: ${esc(l.label || "Link")}</span></button>
              <button class="btn btn-outline btn-sm danger-text" type="button" data-revoke="${l.id}">Widerrufen<span class="visually-hidden">: ${esc(l.label || "Link")}</span></button>
            </td>
          </tr>`;
        }).join("")}</tbody></table></div>` : `<p class="muted">Noch keine Teilen-Links.</p>`}
      <form class="link-add" id="link-form" novalidate>
        <div class="field"><label for="f-label">Bezeichnung <span class="muted">(optional)</span></label>
          <input class="input" id="f-label" maxlength="80" placeholder="z. B. Workshop oder Name der eingeladenen Person" aria-describedby="h-label">
          <span class="hint" id="h-label">Nur für dich sichtbar, damit du Links auseinanderhalten kannst.</span></div>
        <button class="btn btn-primary" type="submit">${icon("share")}Link erzeugen</button>
      </form>`;

    $("#archive").innerHTML = c.state === "archiviert"
      ? `<h2 id="h-arch">Archiviert</h2><p class="muted" style="margin:0">Diese Challenge nimmt keine Einreichungen mehr an. Ergebnisse bleiben sichtbar.</p>`
      : `<h2 id="h-arch">Archivieren</h2>
        <p>Archivierte Challenges nehmen keine neuen Einreichungen mehr an. Wartende und laufende Prüfungen laufen zu Ende,
          Ergebnisse und Lösungsstatus bleiben für Löser sichtbar.</p>
        <button class="btn btn-outline danger-text" type="button" data-archive ${c.state === "gesperrt" ? "disabled" : ""}>${icon("archive")}Challenge archivieren …</button>`;
  }

  function updateLinks(fn) {
    const links = CC.shareLinks(c).slice();
    fn(links);
    CC.saveShareLinks(c, links);
    CC.saveChallenge(id, { shared: links.length > 0 });
  }

  document.addEventListener("submit", e => {
    if (e.target.id === "vis-form") {
      e.preventDefault();
      const v = new FormData(e.target).get("vis");
      CC.saveChallenge(id, { visibility: v });
      render(notice("success", "check", "Sichtbarkeit gespeichert", `<p>Die Challenge ist jetzt ${v === "öffentlich" ? "öffentlich" : "privat"}.</p>`));
    }
    if (e.target.id === "link-form") {
      e.preventDefault();
      const label = $("#f-label").value.trim();
      const l = { id: "l" + CC.randomHex(6), label, created: new Date().toISOString(), expires: new Date(Date.now() + 30 * DAY).toISOString(), guests: 0, code: randomCode() };
      updateLinks(links => links.unshift(l));
      render(notice("success", "check", "Teilen-Link erzeugt",
        `<p>Gültig bis ${CC.fmtDate(l.expires)}. Schick den Link an die Personen, die die Challenge lösen sollen.</p>
         <div class="code-block" style="margin:var(--space-3) 0 0"><pre><code>${esc(linkUrl(l))}</code></pre></div>`));
      CC.addCopyButtons($("#notices"));
      $("#notices").scrollIntoView({ block: "nearest" });
    }
  });

  document.addEventListener("click", async e => {
    const cp = e.target.closest("[data-copy-link]");
    if (cp) {
      const l = CC.shareLinks(c).find(x => x.id === cp.dataset.copyLink);
      const done = () => CC.toast("Link kopiert");
      if (navigator.clipboard) navigator.clipboard.writeText(linkUrl(l)).then(done, done); else done();
    }
    const ex = e.target.closest("[data-extend]");
    if (ex) {
      const exp = new Date(Date.now() + 30 * DAY).toISOString();
      updateLinks(links => { links.find(x => x.id === ex.dataset.extend).expires = exp; });
      render();
      CC.toast(`Link verlängert bis ${CC.fmtDate(exp)}`);
    }
    const rv = e.target.closest("[data-revoke]");
    if (rv) {
      const l = CC.shareLinks(c).find(x => x.id === rv.dataset.revoke);
      const ok = await CC.confirmDialog({
        title: "Teilen-Link widerrufen?",
        body: `<p>${l.label ? `„${esc(l.label)}“: ` : ""}${l.guests === 1 ? "Ein Gast verliert" : `${l.guests} Gäste verlieren`} sofort den Zugriff.
          Ihre Gast-Identitäten, Einreichungen und Ergebnisse werden gelöscht, laufende Prüfungen abgebrochen.</p>
          <p>Angemeldete Nutzer, die nur über diesen Link Zugriff hatten, verlieren ihn ebenfalls. Das lässt sich nicht rückgängig machen.</p>`,
        confirmLabel: "Link widerrufen", danger: true
      });
      if (!ok) return;
      updateLinks(links => links.splice(links.findIndex(x => x.id === l.id), 1));
      render(notice("success", "check", "Teilen-Link widerrufen", "<p>Der Link ist ungültig. Die Daten seiner Gäste wurden gelöscht.</p>"));
    }
    if (e.target.closest("[data-archive]")) {
      const ok = await CC.confirmDialog({
        title: "Challenge archivieren?",
        body: "<p>Neue Einreichungen werden ab sofort abgelehnt. Wartende und laufende Prüfungen laufen zu Ende; Ergebnisse bleiben sichtbar.</p>",
        confirmLabel: "Archivieren", danger: true
      });
      if (!ok) return;
      CC.saveChallenge(id, { state: "archiviert" });
      CC.deleteDraft(id);
      render();
    }
  });

  render();
})();
