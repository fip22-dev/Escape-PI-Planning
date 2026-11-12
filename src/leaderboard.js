import { formatRunTime } from "./game/leaderboard.js";

const ENDPOINT =
  import.meta.env.VITE_LEADERBOARD_URL ||
  "https://6r53f4ec.function2.insforge.app/game-leaderboard";

export function bindLeaderboard(game) {
  const dialog = document.createElement("dialog");
  dialog.className = "feedback-dialog leaderboard-dialog";
  dialog.setAttribute("aria-labelledby", "leaderboard-heading");
  document.querySelector(".page").append(dialog);
  const abort = new AbortController();
  let run = null,
    states = [],
    keyboardEnabled = true,
    busy = false,
    locked = false,
    name = "",
    ownRank = null,
    focusBefore = null,
    request = null,
    generation = 0,
    ignoreEscapeUntil = 0;

  const viewport = () => {
    dialog.style.setProperty(
      "--feedback-height",
      `${Math.max(120, (window.visualViewport?.height ?? innerHeight) - 24)}px`,
    );
    dialog.style.setProperty(
      "--feedback-top",
      `${window.visualViewport?.offsetTop ?? 0}px`,
    );
  };
  window.visualViewport?.addEventListener("resize", viewport, {
    signal: abort.signal,
  });
  window.visualViewport?.addEventListener("scroll", viewport, {
    signal: abort.signal,
  });
  window.addEventListener("resize", viewport, { signal: abort.signal });
  document.addEventListener(
    "fullscreenchange",
    () => {
      if (dialog.open && !document.fullscreenElement)
        ignoreEscapeUntil = performance.now() + 250;
    },
    { signal: abort.signal },
  );
  const base = (heading) => {
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.id = "leaderboard-heading";
    h.textContent = heading;
    const content = document.createElement("div");
    content.className = "leaderboard-content";
    const status = document.createElement("p");
    status.className = "feedback-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    dialog.append(h, content, status);
    return content;
  };
  const message = (text) => {
    dialog.querySelector("[role=status]").textContent = text;
  };
  const paragraph = (parent, text) => {
    const p = document.createElement("p");
    p.textContent = text;
    parent.append(p);
    return p;
  };
  const button = (parent, text, callback, primary = false) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (primary) b.className = "primary";
    b.addEventListener("click", callback);
    parent.append(b);
    return b;
  };
  const close = () => {
    if (busy) return;
    generation++;
    request?.abort();
    dialog.close();
    for (const [scene, input, keyboard] of states) {
      scene.input.enabled = input;
      if (scene.input.keyboard) scene.input.keyboard.enabled = keyboard;
      scene.input.keyboard?.resetKeys();
      scene.touchControls?.clear();
    }
    game.input.keyboard.enabled = keyboardEnabled;
    const fromWin = Boolean(run);
    run = null;
    if (fromWin) {
      const play = game.scene.getScene("graybox");
      if (play?.sys.isActive()) play.scene.start("intro");
    } else focusBefore?.focus?.();
  };
  const fetchData = async (payload) => {
    request?.abort();
    request = new AbortController();
    const current = request;
    const timeout = setTimeout(() => current.abort(), 20000);
    try {
      const url = new URL(ENDPOINT, window.location.href);
      if (!payload && run && ownRank !== null)
        url.searchParams.set("runId", run.runId);
      const response = await fetch(url, {
        method: payload ? "POST" : "GET",
        headers: payload ? { "Content-Type": "application/json" } : {},
        body: payload ? JSON.stringify(payload) : undefined,
        signal: current.signal,
      });
      const data = await response.json();
      return { response, data };
    } finally {
      clearTimeout(timeout);
    }
  };
  const renderBoard = (data) => {
    const c = base("Bestenliste");
    paragraph(
      c,
      "Die 20 schnellsten erfolgreichen Runs · je kleiner die Zeit, desto besser.",
    );
    if (ownRank)
      paragraph(
        c,
        `Dein Run: Platz ${ownRank} · ${formatRunTime(run.elapsedMs)}`,
      );
    if (!Array.isArray(data.entries)) throw Error("invalid response");
    if (!data.entries.length)
      paragraph(
        c,
        "Noch keine Zeiten eingetragen. Die erste Bestzeit wartet auf dich!",
      );
    else {
      const table = document.createElement("table");
      table.className = "leaderboard-table";
      const caption = document.createElement("caption");
      caption.textContent = "Schnellste Runs";
      table.append(caption);
      const head = document.createElement("thead");
      const hr = document.createElement("tr");
      for (const label of ["Platz", "Name", "Zeit"]) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = label;
        hr.append(th);
      }
      head.append(hr);
      table.append(head);
      const body = document.createElement("tbody");
      for (const entry of data.entries) {
        const tr = document.createElement("tr");
        if (entry.id === run?.runId) {
          tr.className = "is-own-run";
          tr.setAttribute("aria-label", "Dein Run");
        }
        for (const text of [
          entry.rank,
          entry.name,
          formatRunTime(entry.elapsedMs),
        ]) {
          const td = document.createElement("td");
          td.textContent = String(text);
          tr.append(td);
        }
        body.append(tr);
      }
      table.append(body);
      c.append(table);
    }
    paragraph(
      c,
      "Bei gleicher Zeit steht der früher gespeicherte Run zuerst. Jeder Eintrag gehört zu einem Run; Namen sind nicht exklusiv.",
    );
    button(c, "Aktualisieren", loadBoard);
    const back = button(
      c,
      run ? "Zum Hauptmenü" : "Zurück zum Hauptmenü",
      close,
      true,
    );
    back.focus();
  };
  const loadBoard = async () => {
    const version = ++generation;
    const c = base("Bestenliste");
    paragraph(c, "Bestenliste wird geladen …");
    button(c, run ? "Zum Hauptmenü" : "Zurück zum Hauptmenü", close);
    try {
      const { response, data } = await fetchData();
      if (!dialog.open || version !== generation) return;
      if (!response.ok)
        throw Error(
          data.error || "Die Bestenliste ist gerade nicht erreichbar.",
        );
      if (run && ownRank !== null)
        ownRank = Number.isInteger(data.rank) ? data.rank : null;
      renderBoard(data);
    } catch (error) {
      if (!dialog.open || version !== generation) return;
      const content = base("Bestenliste");
      paragraph(
        content,
        "Die Bestenliste konnte nicht geladen werden. Bitte die Verbindung prüfen und erneut versuchen.",
      );
      button(content, "Erneut laden", loadBoard, true);
      button(content, run ? "Zum Hauptmenü" : "Zurück zum Hauptmenü", close);
    }
  };
  const renderEntry = (error = "") => {
    const c = base("Geschafft!");
    paragraph(c, `Deine Zeit: ${formatRunTime(run.elapsedMs)}`);
    paragraph(
      c,
      "Trage deinen Namen oder ein Pseudonym ein. Name und Zeit erscheinen öffentlich in der Bestenliste. Bitte keine vertraulichen Angaben verwenden.",
    );
    const form = document.createElement("form");
    form.noValidate = true;
    const label = document.createElement("label");
    label.htmlFor = "leaderboard-name";
    label.textContent = "Name / Pseudonym";
    const input = document.createElement("input");
    input.id = "leaderboard-name";
    input.name = "playerName";
    input.minLength = 2;
    input.maxLength = 24;
    input.required = true;
    input.autocomplete = "off";
    input.value = name;
    input.disabled = locked;
    input.setAttribute("aria-describedby", "leaderboard-name-help");
    const hint = document.createElement("small");
    hint.id = "leaderboard-name-help";
    hint.textContent =
      "2–24 Zeichen: Buchstaben, Ziffern, Leerzeichen, Punkt, Bindestrich oder Unterstrich.";
    form.append(label, input, hint);
    c.append(form);
    input.addEventListener("input", () => {
      name = input.value;
      input.removeAttribute("aria-invalid");
      message("");
    });
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "primary";
    submit.textContent = locked ? "Erneut speichern" : "Zeit eintragen";
    form.append(submit);
    button(c, "Ohne Eintrag zur Bestenliste", loadBoard);
    button(c, "Zum Hauptmenü", close);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (busy) return;
      if (!locked)
        name = input.value.normalize("NFC").trim().replace(/ +/g, " ");
      if (!/^[\p{L}\p{N} ._-]{2,24}$/u.test(name)) {
        input.setAttribute("aria-invalid", "true");
        message("Bitte einen gültigen Namen mit 2–24 Zeichen eingeben.");
        input.focus();
        return;
      }
      busy = true;
      locked = true;
      for (const b of dialog.querySelectorAll("button,input"))
        b.disabled = true;
      message("Zeit wird gespeichert …");
      try {
        const { response, data } = await fetchData({ ...run, name });
        if (
          [200, 201].includes(response.status) &&
          Number.isInteger(data.rank) &&
          Array.isArray(data.entries)
        ) {
          ownRank = data.rank;
          busy = false;
          renderBoard(data);
          message("Deine Zeit ist gespeichert.");
          return;
        }
        // Definite validation/quota failures did not create a score. A timeout or
        // server error can be ambiguous: retry the unchanged run and name.
        if ([400, 403, 413, 429].includes(response.status)) locked = false;
        busy = false;
        renderEntry(
          (data.error ||
            "Keine sichere Speicherbestätigung. Bitte erneut versuchen.") +
            (response.headers.get("Retry-After")
              ? ` Wartezeit: ${response.headers.get("Retry-After")} Sekunden.`
              : ""),
        );
      } catch {
        busy = false;
        renderEntry(
          "Keine sichere Speicherbestätigung. Dein Name bleibt erhalten. Bitte denselben Eintrag erneut speichern.",
        );
      }
    });
    message(error);
    if (locked) submit.focus();
    else input.focus();
  };
  const open = (event) => {
    if (document.querySelector(".feedback-dialog[open]")) return;
    run = event.detail?.run || null;
    name = "";
    locked = false;
    ownRank = null;
    busy = false;
    focusBefore = document.activeElement;
    states = game.scene
      .getScenes(true)
      .map((s) => [s, s.input.enabled, s.input.keyboard?.enabled]);
    keyboardEnabled = game.input.keyboard.enabled;
    for (const [scene] of states) {
      scene.touchControls?.clear();
      scene.input.keyboard?.resetKeys();
      scene.input.enabled = false;
      if (scene.input.keyboard) scene.input.keyboard.enabled = false;
    }
    game.input.keyboard.enabled = false;
    if (run) {
      const play = game.scene.getScene("graybox");
      play?.resultPanel?.setVisible(false);
      play?.resultText?.setVisible(false);
    }
    viewport();
    dialog.showModal();
    if (run) renderEntry();
    else void loadBoard();
  };
  window.addEventListener("game:leaderboard", open, { signal: abort.signal });
  dialog.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      if (performance.now() >= ignoreEscapeUntil) close();
    },
    { signal: abort.signal },
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (!dialog.open) return;
      if (event.key === "Escape") {
        if (document.fullscreenElement) return;
        event.preventDefault();
        if (performance.now() >= ignoreEscapeUntil) close();
      }
      if (event.key === "Enter" && event.target.matches("input"))
        event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true, signal: abort.signal },
  );
  window.addEventListener(
    "keyup",
    (event) => {
      if (dialog.open) event.stopImmediatePropagation();
    },
    { capture: true, signal: abort.signal },
  );
  return {
    destroy() {
      generation++;
      request?.abort();
      abort.abort();
      dialog.remove();
    },
  };
}
