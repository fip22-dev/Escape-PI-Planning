const ENDPOINT =
  import.meta.env.VITE_FEEDBACK_URL ||
  "https://6r53f4ec.function2.insforge.app/game-feedback";

export function submissionId(now = Date.now()) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let stamp = BigInt(now);
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(stamp & 255n);
    stamp >>= 8n;
  }
  bytes[6] = (bytes[6] & 15) | 112;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function bindFeedback(game) {
  const button = document.querySelector(".feedback-button"),
    page = document.querySelector(".page");
  const dialog = document.createElement("dialog");
  dialog.className = "feedback-dialog";
  dialog.setAttribute("aria-labelledby", "feedback-heading");
  page.append(dialog);
  const abort = new AbortController();
  let drafts = {},
    kind = null,
    snapshot = {},
    sceneStates = [],
    busy = false,
    sent = false,
    locked = false,
    controller = null,
    ignoreCancelUntil = 0;
  const updateViewport = () => {
    dialog.style.setProperty(
      "--feedback-height",
      `${Math.max(120, (window.visualViewport?.height ?? innerHeight) - 24)}px`,
    );
    dialog.style.setProperty(
      "--feedback-top",
      `${window.visualViewport?.offsetTop ?? 0}px`,
    );
  };
  window.visualViewport?.addEventListener("resize", updateViewport, {
    signal: abort.signal,
  });
  window.visualViewport?.addEventListener("scroll", updateViewport, {
    signal: abort.signal,
  });
  window.addEventListener("resize", updateViewport, { signal: abort.signal });
  document.addEventListener(
    "fullscreenchange",
    () => {
      if (dialog.open && !document.fullscreenElement)
        ignoreCancelUntil = performance.now() + 250;
    },
    { signal: abort.signal },
  );
  const empty = () => ({
    title: "",
    description: "",
    consent: false,
    technical: true,
    website: "",
    id: submissionId(),
    payload: null,
  });
  const dirty = () =>
    Object.values(drafts).some((d) => d.title || d.description || d.consent);
  const capture = () => {
    if (!kind || !dialog.querySelector("form")) return;
    const f = dialog.querySelector("form"),
      d = drafts[kind];
    d.title = f.elements.title.value;
    d.description = f.elements.description.value;
    d.consent = f.elements.consent.checked;
    d.technical = f.elements.technical.checked;
    d.website = f.elements.website.value;
  };
  const close = () => {
    if (busy) return;
    capture();
    if (!sent && dirty()) {
      renderDiscard();
      return;
    }
    finishClose();
  };
  const finishClose = () => {
    dialog.close();
    controller?.abort();
    for (const [scene, input, keyboard] of sceneStates) {
      scene.input.enabled = input;
      if (scene.input.keyboard) scene.input.keyboard.enabled = keyboard;
      scene.input.keyboard?.resetKeys();
      scene.touchControls?.clear();
    }
    game.input.keyboard.enabled = true;
    drafts = {};
    kind = null;
    button.focus();
  };
  const base = (heading) => {
    dialog.innerHTML = `<h2 id="feedback-heading">${heading}</h2><div class="feedback-content"></div><p class="feedback-status" role="status" aria-live="polite"></p>`;
    return dialog.querySelector(".feedback-content");
  };
  const status = (text) => {
    dialog.querySelector(".feedback-status").textContent = text;
  };
  const action = (parent, label, fn, primary = false) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (primary) b.className = "primary";
    b.addEventListener("click", fn);
    parent.append(b);
    return b;
  };
  const renderChoice = () => {
    kind = null;
    locked = false;
    const c = base("Bug / Feature melden");
    const actions = document.createElement("div");
    actions.className = "feedback-actions";
    c.append(actions);
    for (const [type, label] of [
      ["bug", "Bug"],
      ["feature", "Feature"],
    ])
      action(
        actions,
        label,
        () => {
          kind = type;
          drafts[kind] ??= empty();
          renderForm();
        },
        true,
      );
    action(c, "Abbrechen", close);
    dialog.querySelector("button").focus();
  };
  const renderDiscard = () => {
    const c = base("Entwurf verwerfen?");
    action(
      c,
      "Weiter bearbeiten",
      () => (kind ? renderForm() : renderChoice()),
      true,
    );
    action(c, "Verwerfen", finishClose);
    dialog.querySelector("button").focus();
  };
  const renderForm = () => {
    const d = drafts[kind],
      isBug = kind === "bug";
    locked = Boolean(d.payload);
    const c = base(isBug ? "Bug melden" : "Feature wünschen");
    c.innerHTML = `<p>${isBug ? "Was funktioniert nicht wie erwartet?" : "Was würdest du dir für das Spiel wünschen?"}</p>
      <form novalidate>
        <label for="feedback-title">Titel</label><input id="feedback-title" name="title" required minlength="5" maxlength="120" autocomplete="off" aria-describedby="title-error"><span class="field-error" id="title-error"></span>
        <label for="feedback-description">Beschreibung</label><textarea id="feedback-description" name="description" required minlength="10" maxlength="5000" rows="5" aria-describedby="description-help description-error"></textarea>
        <small id="description-help">${isBug ? "Was passiert und was sollte stattdessen passieren? Wenn möglich, beschreibe kurz, wie man den Bug auslösen kann." : "Beschreibe deinen Wunsch und was dadurch besser würde."}</small><span class="field-error" id="description-error"></span>
        <details><summary>Technische Angaben</summary><label class="check"><input type="checkbox" name="technical">Technische Angaben mitsenden</label><pre class="technical-preview"></pre></details>
        <p class="feedback-notice">Deine Meldung wird als öffentliches GitHub-Issue gespeichert. Eine spätere automatische KI-Analyse ist geplant und noch nicht aktiv. Bitte keine persönlichen oder vertraulichen Angaben eintragen. Zum Absenden brauchst du kein GitHub-Konto.</p>
        <label class="check"><input type="checkbox" name="consent" required>Ich habe den Hinweis zur Speicherung und geplanten automatischen Analyse gelesen</label><span class="field-error" id="consent-error"></span>
        <label class="feedback-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
        <div class="feedback-actions"><button type="button" data-back>Zurück</button><button type="button" data-cancel>Abbrechen</button><button type="submit" class="primary">${isBug ? "Bug senden" : "Feature senden"}</button></div>
      </form>`;
    const f = c.querySelector("form");
    f.elements.title.value = d.title;
    f.elements.description.value = d.description;
    f.elements.technical.checked = d.technical;
    f.elements.consent.checked = d.consent;
    const technical = { ...snapshot };
    if (!isBug)
      for (const k of ["room", "position", "remainingSeconds", "keys"])
        delete technical[k];
    const preview = () => {
      c.querySelector(".technical-preview").textContent = f.elements.technical
        .checked
        ? JSON.stringify(technical, null, 2)
        : "Es werden keine technischen Angaben mitgesendet.";
    };
    preview();
    if (locked) {
      for (const el of f.elements)
        if (["INPUT", "TEXTAREA"].includes(el.tagName)) el.disabled = true;
      f.querySelector("[type=submit]").textContent = "Erneut versuchen";
      status(
        "Diese Meldung wird noch abgeglichen. Für einen sicheren erneuten Versuch bleibt ihr Inhalt unverändert.",
      );
    }
    f.addEventListener("input", () => {
      capture();
      preview();
      if (f.dataset.validated) validate();
    });
    f.querySelector("[data-back]").onclick = () => {
      capture();
      renderChoice();
    };
    f.querySelector("[data-cancel]").onclick = close;
    const validate = () => {
      capture();
      let first;
      for (const [name, valid, message] of [
        [
          "title",
          d.title.trim().length >= 5 && d.title.trim().length <= 120,
          "Bitte 5–120 Zeichen eingeben.",
        ],
        [
          "description",
          d.description.trim().length >= 10 &&
            d.description.trim().length <= 5000,
          "Bitte 10–5000 Zeichen eingeben.",
        ],
        ["consent", d.consent, "Bitte den Hinweis bestätigen."],
      ]) {
        f.querySelector("#" + name + "-error").textContent = valid
          ? ""
          : message;
        f.elements[name].setAttribute("aria-invalid", String(!valid));
        if (!valid) first ??= f.elements[name];
      }
      return first;
    };
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      f.dataset.validated = "true";
      const invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }
      const payload = d.payload || {
        schemaVersion: 1,
        submissionId: d.id,
        kind,
        title: d.title.trim(),
        description: d.description.trim(),
        consent: true,
        website: d.website,
        ...(d.technical ? { technical } : {}),
      };
      d.payload = payload;
      busy = true;
      locked = true;
      for (const el of f.elements) el.disabled = true;
      status("Wird gesendet …");
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const r = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = await r.json();
        if (
          [200, 201].includes(r.status) &&
          Number.isInteger(data.issueNumber) &&
          /^https:\/\/github\.com\/fip22-dev\/Escape-PI-Planning\/issues\/\d+$/.test(
            data.issueUrl,
          )
        ) {
          sent = true;
          drafts = {};
          busy = false;
          const content = base("Danke!");
          const p = document.createElement("p");
          p.textContent = `Deine Meldung wurde als Issue #${data.issueNumber} gespeichert.`;
          content.append(p);
          const a = document.createElement("a");
          a.href = data.issueUrl;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = "Issue auf GitHub öffnen";
          content.append(a);
          action(content, "Zurück", finishClose, true);
          content.querySelector("button").focus();
          return;
        }
        if ([400, 413, 429, 503, 403].includes(r.status)) {
          d.payload = null;
          locked = false;
        }
        renderForm();
        status(
          (data.error || "Die Zustellung ist noch unbestätigt.") +
            (r.headers.get("Retry-After")
              ? ` Wartezeit: ${r.headers.get("Retry-After")} Sekunden.`
              : ""),
        );
      } catch {
        renderForm();
        status(
          navigator.onLine
            ? "Keine sichere Zustellbestätigung. Bitte mit „Erneut versuchen“ dieselbe Meldung abgleichen."
            : "Du bist offline. Dein Entwurf bleibt erhalten. Bitte später erneut versuchen.",
        );
      } finally {
        clearTimeout(timeout);
        busy = false;
      }
    });
    f.elements.title.focus();
  };
  const open = () => {
    const active = game.scene.getScenes(true);
    const play = active.find((s) => s.sys.settings.key === "graybox");
    if (
      play &&
      (play.gameResult || play.caughtDialog || play.startGuideVisible)
    ) {
      button.title = "Bitte zuerst den aktuellen Spieldialog abschliessen.";
      return;
    }
    const ua = navigator.userAgent;
    snapshot = {
      build: import.meta.env.VITE_BUILD_ID || "feedback-v1",
      browser: /Firefox\//.test(ua)
        ? "Firefox"
        : /Edg\//.test(ua)
          ? "Edge"
          : /Chrome\//.test(ua)
            ? "Chromium"
            : /Safari\//.test(ua)
              ? "Safari"
              : "unbekannt",
      os: /iPhone|iPad/.test(ua)
        ? "iOS/iPadOS"
        : /Android/.test(ua)
          ? "Android"
          : /Windows/.test(ua)
            ? "Windows"
            : /Mac OS/.test(ua)
              ? "macOS"
              : /Linux/.test(ua)
                ? "Linux"
                : "unbekannt",
      viewport: `${innerWidth} × ${innerHeight}`,
      orientation: innerHeight > innerWidth ? "Hochformat" : "Querformat",
      input: matchMedia("(pointer: coarse)").matches
        ? "Touch"
        : "Maus/Tastatur",
      view: page.classList.contains("is-menu")
        ? "Startmenü"
        : page.dataset.displayMode || "normal",
    };
    if (play) {
      snapshot.position = `${play.playerTile.x}, ${play.playerTile.y}`;
      snapshot.room =
        play.rooms?.find(
          (r) =>
            play.playerTile.x >= r.x &&
            play.playerTile.x < r.x + r.width &&
            play.playerTile.y >= r.y &&
            play.playerTile.y < r.y + r.height,
        )?.label || "Gang";
      snapshot.remainingSeconds = Math.max(
        0,
        Math.ceil(
          (180000 -
            (play.escapeStartedAt === null
              ? 0
              : (play.isPaused ? play.pauseStartedAt : play.time.now) -
                play.escapeStartedAt)) /
            1000,
        ),
      );
      snapshot.keys =
        play.collectedTeamKeys?.size ??
        play.teamKeys?.filter((k) => k.collected).length ??
        0;
      if (!play.isPaused) play.pauseGame();
    }
    sceneStates = active.map((s) => [
      s,
      s.input.enabled,
      s.input.keyboard?.enabled,
    ]);
    for (const [s] of sceneStates) {
      s.touchControls?.clear();
      s.input.keyboard?.resetKeys();
      s.input.enabled = false;
      if (s.input.keyboard) s.input.keyboard.enabled = false;
    }
    game.input.keyboard.enabled = false;
    drafts = {};
    kind = null;
    sent = false;
    busy = false;
    updateViewport();
    dialog.showModal();
    renderChoice();
  };
  button.addEventListener("click", open, { signal: abort.signal });
  dialog.addEventListener(
    "cancel",
    (e) => {
      e.preventDefault();
      if (performance.now() >= ignoreCancelUntil) close();
    },
    { signal: abort.signal },
  );
  const key = (e) => {
    if (!dialog.open) return;
    // Keep native editing and modal focus behavior, but isolate Phaser/global shortcuts.
    if (e.key === "Escape") {
      if (document.fullscreenElement) return;
      e.preventDefault();
      if (performance.now() >= ignoreCancelUntil) close();
    }
    if (e.key === "Enter" && e.target.matches("input")) e.preventDefault();
    e.stopImmediatePropagation();
  };
  window.addEventListener("keydown", key, {
    capture: true,
    signal: abort.signal,
  });
  window.addEventListener(
    "keyup",
    (e) => {
      if (dialog.open) e.stopImmediatePropagation();
    },
    { capture: true, signal: abort.signal },
  );
  return {
    destroy() {
      controller?.abort();
      abort.abort();
      dialog.remove();
    },
  };
}
