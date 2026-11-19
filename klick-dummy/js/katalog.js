/* Seite: Challenge-Katalog */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { D, $, esc, store, isGuest } = CC;
  if (isGuest) { location.replace("challenge.html?id=" + CC.guestChallengeId); return; }

  const visible = c => c && c.state !== "entwurf" && (c.visibility === "öffentlich" || c.shared || (c.owner && CC.role === "autor"));
  const els = { q: $("#f-q"), format: $("#f-format"), diff: $("#f-diff"), status: $("#f-status") };
  const saved = store.get("filters", {});
  Object.keys(els).forEach(k => { if (saved[k]) els[k].value = saved[k]; });

  function render() {
    const f = { q: els.q.value.trim().toLowerCase(), format: els.format.value, diff: els.diff.value, status: els.status.value };
    store.set("filters", f);
    const items = CC.allChallenges().filter(visible).filter(c =>
      (!f.q || (c.title + " " + c.summary).toLowerCase().includes(f.q)) &&
      (!f.format || c.format === f.format) &&
      (!f.diff || c.difficulty === f.diff) &&
      (!f.status || (c.status || { kind: "offen" }).kind === f.status));
    $("#result-count").textContent = items.length === 1 ? "1 Challenge" : items.length + " Challenges";
    $("#challenge-list").innerHTML = items.length ? items.map(c => `
      <li><article class="challenge-card">
        <h2><a href="challenge.html?id=${c.id}">${esc(c.title)}</a></h2>
        ${CC.tagsHtml(c)}
        <p>${esc(c.summary)}</p>
        <div class="card-foot"><span>von ${esc(c.author)}</span>${CC.statusPill(c, true)}</div>
      </article></li>`).join("")
      : `<li class="empty-state" style="grid-column:1/-1"><h2>Keine Challenge gefunden</h2>
          <p class="muted">Passe die Suche oder die Filter an.</p>
          <button class="btn btn-outline" type="button" data-reset-filters>Filter zurücksetzen</button></li>`;
  }
  Object.values(els).forEach(el => el.addEventListener("input", render));
  document.addEventListener("click", e => {
    if (e.target.closest("[data-reset-filters]")) { Object.values(els).forEach(el => { el.value = ""; }); render(); els.q.focus(); }
  });
  render();
})();
