/* Seite: Meine Daten – Daten-Export und Account löschen */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { $, icon, notice, store, isGuest } = CC;
  if (isGuest) { location.replace("challenge.html?id=" + CC.guestChallengeId); return; }

  if (CC.role === "autor") $("#delete-author").hidden = false;

  $("#export-btn").addEventListener("click", () => {
    const btn = $("#export-btn"), out = $("#export-result");
    btn.disabled = true;
    btn.innerHTML = `${icon("spinner")}Export wird vorbereitet …`;
    out.innerHTML = "";
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `${icon("download")}Export erneut anfordern`;
      out.innerHTML = notice("success", "check", "Dein Export ist bereit",
        `<p><a href="#" data-fake-download>daten-export-${new Date().toISOString().slice(0, 10)}.zip herunterladen</a> (ca. 180 KB)</p>`);
    }, 1800);
  });

  $("#delete-btn").addEventListener("click", async () => {
    const ok = await CC.confirmDialog({
      title: "Account endgültig löschen?",
      body: `<p>Dein Account und alle zugehörigen Daten werden sofort gelöscht. Laufende Prüfungen werden abgebrochen.</p>
             <p>Das lässt sich nicht rückgängig machen. Lade vorher deine Daten herunter, wenn du sie behalten möchtest.</p>`,
      confirmLabel: "Account löschen",
      danger: true,
      requireCheck: "Ich habe verstanden, dass alle meine Daten unwiderruflich gelöscht werden."
    });
    if (!ok) return;
    store.clear(["theme"]);
    location.href = "index.html?geloescht=1";
  });
})();
