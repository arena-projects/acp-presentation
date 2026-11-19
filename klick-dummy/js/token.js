/* Seite: Push-Token – höchstens ein Token pro Löser, nur „neu erzeugen“, einmalige Anzeige */
(function () {
  "use strict";
  const CC = window.CC;
  if (!CC || CC.halt) return;
  const { D, $, esc, icon, notice, store, isGuest } = CC;

  const key = isGuest ? "tokenGuest" : "tokenUser";
  const getCreated = () => store.get(key, isGuest ? null : D.user.tokenCreatedAt);
  const gc = D.challenges.find(c => c.id === CC.guestChallengeId);

  function newToken() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    return "ccpt_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  function render(shownToken) {
    const created = getCreated();
    $("#token-scope").innerHTML = isGuest
      ? notice("info", "share", null, `<p>Dein Token gilt nur für die Challenge <a href="challenge.html?id=${gc.id}">${esc(gc.title)}</a>
         und endet mit deinem Zugang am ${CC.fmtDate(D.guestLink.expires)}.</p>`)
      : "";
    $("#token-state").innerHTML = `
      <h2>Dein Token</h2>
      ${shownToken ? `
        ${notice("success", "check", "Neues Token erzeugt", "<p>Kopiere das Token jetzt und bewahre es sicher auf. Es wird <strong>nur dieses eine Mal</strong> angezeigt.</p>")}
        <div class="code-block token-value" style="margin-top:var(--space-4)"><pre><code>${esc(shownToken)}</code></pre></div>
      ` : created
        ? `<p class="token-status">${icon("key")}<span>Token vorhanden, erzeugt am <strong>${CC.fmtDateTime(created)}</strong>.</span></p>
           <p class="muted small">Das Token selbst lässt sich nicht erneut anzeigen. Hast du es verloren, erzeuge ein neues.</p>`
        : `<p class="token-status muted">${icon("circle")}<span>Du hast noch kein Token.</span></p>`}
      <div class="form-actions" style="margin-top:var(--space-4)">
        <button class="btn ${created && !shownToken ? "btn-outline" : "btn-primary"}" type="button" data-generate>${icon("key")}${created ? "Token neu erzeugen" : "Token erzeugen"}</button>
      </div>`;
    CC.addCopyButtons($("#token-state"));
  }

  document.addEventListener("click", async e => {
    if (!e.target.closest("[data-generate]")) return;
    if (getCreated()) {
      const ok = await CC.confirmDialog({
        title: "Neues Token erzeugen?",
        body: "<p>Dein bisheriges Token wird sofort ungültig. Pushes mit dem alten Token werden abgelehnt, bis du überall das neue verwendest.</p>",
        confirmLabel: "Neues Token erzeugen"
      });
      if (!ok) return;
    }
    store.set(key, new Date().toISOString());
    render(newToken());
    $("#token-state h2").setAttribute("tabindex", "-1");
    $("#token-state h2").focus();
  });

  $("#token-host").textContent = D.host;
  render(null);
})();
