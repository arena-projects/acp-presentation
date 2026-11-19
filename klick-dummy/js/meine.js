/* Seite: Meine Challenges (Autor) – eigene Challenges inkl. Entwürfe */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { $, esc, icon } = CC;

  const ORDER = { entwurf: 0, freigegeben: 1, gesperrt: 2, archiviert: 3 };

  function render() {
    const own = CC.allChallenges().filter(c => c && c.owner)
      .sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.title.localeCompare(b.title, "de"));
    $("#own-count").textContent = own.length === 1 ? "1 Challenge" : own.length + " Challenges";
    if (!own.length) {
      $("#own-list").innerHTML = `<div class="card empty-state"><h2>Noch keine eigenen Challenges</h2>
        <p class="muted">Lege deine erste Challenge an. Sie bleibt ein privater Entwurf, bis du sie freigibst.</p>
        <button class="btn btn-primary" type="button" data-new>Neue Challenge</button></div>`;
      return;
    }
    $("#own-list").innerHTML = `<div class="card table-card">
      <table class="data-table">
        <caption class="visually-hidden">Eigene Challenges</caption>
        <thead><tr><th scope="col">Titel</th><th scope="col">Format</th><th scope="col">Status</th><th scope="col">Sichtbarkeit</th><th scope="col">Version</th><th scope="col"><span class="visually-hidden">Aktionen</span></th></tr></thead>
        <tbody>${own.map(c => {
          const links = CC.shareLinks(c).length;
          const vis = `${c.visibility === "öffentlich" ? "Öffentlich" : "Privat"}${links ? `<br><span class="small muted">${icon("share")} ${links} Teilen-Link${links > 1 ? "s" : ""}</span>` : ""}`;
          const d = CC.getDraft(c.id);
          const title = c.state === "entwurf" && d ? d.title : c.title;
          const changed = c.state === "entwurf" || (d && !d.fresh) ? `<span class="small muted">geändert am ${CC.fmtDate(d.changedAt)}</span>` : "";
          return `<tr>
            <th scope="row" data-label="Titel"><a href="${c.state === "entwurf" ? "editor" : "verwalten"}.html?id=${c.id}">${esc(title)}</a><br>${changed}</th>
            <td data-label="Format"><span class="tag">${c.format === "wert" ? "Wert" : "Code"}</span></td>
            <td data-label="Status">${CC.ownStateBadge(c)}</td>
            <td data-label="Sichtbarkeit">${vis}</td>
            <td data-label="Version">${c.version || "–"}</td>
            <td class="row-actions">
              ${c.state === "archiviert" ? "" : `<a class="btn btn-outline btn-sm" href="editor.html?id=${c.id}">Bearbeiten<span class="visually-hidden">: ${esc(title)}</span></a>`}
              ${c.state === "entwurf" ? "" : `<a class="btn btn-outline btn-sm" href="verwalten.html?id=${c.id}">Verwalten<span class="visually-hidden">: ${esc(c.title)}</span></a>`}
            </td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>`;
  }

  document.addEventListener("click", e => {
    if (e.target.closest("[data-new]")) location.href = "editor.html?id=" + CC.createChallenge() + "&neu=1";
  });
  render();
})();
