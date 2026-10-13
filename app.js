(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const DAY_FULL = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
  const JS_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ROW = 62, BRK = 26;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hueOf = (key) => { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };

  /* ---------- Flatten the data into one session per period ---------- */
  const parseSlots = (str) =>
    String(str).split(",").map((s) => s.trim()).filter(Boolean)
      .map((s) => ({ p: parseInt(s.replace(/\D/g, ""), 10), lab: s.includes("*") }));

  const sessions = [];
  GROUPS.forEach((g) => g.courses.forEach((c, i) => {
    c.id = `${g.id}-${i}`;
    Object.entries(c.slots || {}).forEach(([day, str]) =>
      parseSlots(str).forEach(({ p, lab }) =>
        sessions.push({ g, c, day, p, lab, teacher: c.teacher, room: lab ? LAB_ROOM : (c.room || g.room) })));
  }));

  const teachers = [...new Set(GROUPS.flatMap((g) => g.courses.map((c) => c.teacher)))].filter((t) => t && t !== "TBA").sort();
  const rooms = [...new Set(sessions.map((s) => s.room))].sort((a, b) => (a === LAB_ROOM) - (b === LAB_ROOM) || a.localeCompare(b));
  const byId = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

  /* ---------- State (kept in the URL hash so links can be shared) ---------- */
  const today = new Date();
  const state = { group: "stat2", teacher: "", day: "", free: { type: "student", id: "stat2" }, sel: new Date(today), cal: new Date(today.getFullYear(), today.getMonth(), 1) };

  (function readHash() {
    const q = new URLSearchParams(location.hash.slice(1));
    if (q.has("t") && teachers.includes(q.get("t"))) { state.teacher = q.get("t"); state.group = ""; }
    else if (q.has("g")) state.group = byId[q.get("g")] ? q.get("g") : (q.get("g") === "all" ? "" : state.group);
    if (DAYS.includes(q.get("d"))) state.day = q.get("d");
  })();

  function writeHash() {
    const q = new URLSearchParams();
    if (state.teacher) q.set("t", state.teacher); else q.set("g", state.group || "all");
    if (state.day) q.set("d", state.day);
    history.replaceState(null, "", "#" + q.toString());
  }

  /* ---------- Helpers ---------- */
  const periodTime = (a, b) => `${PERIODS[a - 1].start}-${PERIODS[b - 1].end}`;
  const yOf = (p) => (p <= 4 ? (p - 1) * ROW : 4 * ROW + BRK + (p - 5) * ROW);

  // Merge consecutive periods of the same course into one block
  function toRuns(list) {
    const map = new Map();
    list.forEach((s) => {
      const k = [s.g.id, s.c.id, s.day].join("|");
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    });
    const runs = [];
    map.forEach((arr) => {
      arr.sort((a, b) => a.p - b.p);
      let cur = null;
      arr.forEach((s) => {
        if (cur && s.p === cur.end + 1 && s.lab === cur.lab && s.p !== 5) { cur.end = s.p; }
        else { cur = { g: s.g, c: s.c, day: s.day, start: s.p, end: s.p, lab: s.lab, room: s.room, teacher: s.teacher }; runs.push(cur); }
      });
    });
    return runs;
  }

  function filtered(ignoreDay) {
    return sessions.filter((s) =>
      (!state.group || s.g.id === state.group) &&
      (!state.teacher || s.teacher === state.teacher) &&
      (ignoreDay || !state.day || s.day === state.day));
  }

  function slotsHtml(withLabels) {
    let h = "";
    for (let p = 1; p <= 8; p++) {
      if (p === 5) h += `<div class="brk">${withLabels ? "Break" : ""}</div>`;
      const P = PERIODS[p - 1];
      h += withLabels ? `<div class="slot"><b>${p}</b><span>${P.start}</span><span>${P.end}</span></div>` : `<div class="slot"></div>`;
    }
    return h;
  }

  // Give overlapping blocks in the same day their own side-by-side lanes
  function assignLanes(runs) {
    runs.sort((a, b) => a.start - b.start || b.end - a.end);
    let cluster = [], clusterEnd = -1;
    const flush = () => {
      const lanes = [];
      cluster.forEach((r) => {
        let i = lanes.findIndex((end) => end < r.start);
        if (i < 0) { i = lanes.length; lanes.push(0); }
        lanes[i] = r.end; r.lane = i;
      });
      cluster.forEach((r) => (r.lanes = lanes.length));
      cluster = [];
    };
    runs.forEach((r) => {
      if (cluster.length && r.start > clusterEnd) { flush(); clusterEnd = -1; }
      cluster.push(r); clusterEnd = Math.max(clusterEnd, r.end);
    });
    if (cluster.length) flush();
  }

  /* ---------- Header chips ---------- */
  $("#heroStats").innerHTML = [
    [GROUPS.length, "student groups"],
    [GROUPS.reduce((n, g) => n + g.courses.length, 0), "courses"],
    [teachers.length, "instructors"],
    [rooms.length, "rooms"],
  ].map(([n, t]) => `<li><b>${n}</b>${t}</li>`).join("");

  /* ---------- Filters ---------- */
  function buildFilters() {
    const programs = ["Statistics", "Data Science"];
    $("#groupSel").innerHTML = `<option value="">All student groups</option>` +
      programs.map((p) => `<optgroup label="${p}">${GROUPS.filter((g) => g.program === p).map((g) => `<option value="${g.id}">${esc(g.label)}</option>`).join("")}</optgroup>`).join("");
    $("#teacherSel").innerHTML = `<option value="">All teachers</option>` + teachers.map((t) => `<option>${esc(t)}</option>`).join("");
    $("#daySel").innerHTML = `<option value="">All days</option>` + DAYS.map((d) => `<option value="${d}">${DAY_FULL[d]}</option>`).join("");
  }

  function syncFilters() {
    $("#groupSel").value = state.group;
    $("#teacherSel").value = state.teacher;
    $("#daySel").value = state.day;
  }

  $("#groupSel").addEventListener("change", (e) => { state.group = e.target.value; state.teacher = ""; update(); });
  $("#teacherSel").addEventListener("change", (e) => { state.teacher = e.target.value; if (state.teacher) state.group = ""; update(); });
  $("#daySel").addEventListener("change", (e) => { state.day = e.target.value; update(); });
  $("#resetBtn").addEventListener("click", () => { state.group = "stat2"; state.teacher = ""; state.day = ""; update(); });

  /* ---------- Weekly grid ---------- */
  function renderGrid() {
    const list = filtered();
    const days = state.day ? [state.day] : DAYS;
    const multi = !state.group;
    const todayName = JS_DAY[today.getDay()];
    const runsByDay = Object.fromEntries(days.map((d) => [d, []]));
    toRuns(list).forEach((r) => runsByDay[r.day].push(r));

    if (!list.length) {
      $("#grid").innerHTML = `<div class="empty">No classes match these filters.</div>`;
      return;
    }

    let h = `<div class="tt" style="--cols:${days.length}"><div class="tt-row tt-head"><div class="cell">Period</div>` +
      days.map((d) => `<div class="cell${d === todayName ? " today" : ""}">${DAY_FULL[d]}${d === todayName ? "<small>Today</small>" : ""}</div>`).join("") +
      `</div><div class="tt-body"><div class="col">${slotsHtml(true)}</div>`;

    days.forEach((d) => {
      const runs = runsByDay[d];
      assignLanes(runs);
      h += `<div class="col">${slotsHtml(false)}`;
      runs.forEach((r) => {
        const top = yOf(r.start), height = yOf(r.end) + ROW - top;
        const w = 100 / r.lanes;
        const span = r.end - r.start + 1;
        const room = r.lab ? LAB_ROOM : r.room;
        const tip = `${r.c.title} (${r.c.code})\n${r.g.label}\n${DAY_FULL[r.day]} ${periodTime(r.start, r.end)}\nRoom: ${room}\nInstructor: ${r.teacher}`;
        h += `<div class="blk${r.lab ? " lab" : ""}${span === 1 ? " short" : ""}" title="${esc(tip)}" style="--h:${hueOf(r.c.code)};top:${top}px;height:${height - 4}px;left:calc(${r.lane * w}% );width:calc(${w}% - 4px)">` +
          (r.lab ? `<span class="tag">LAB</span>` : "") +
          (multi ? `<span class="grp">${esc(r.g.short)}</span>` : "") +
          `<b>${esc(r.c.title)}</b>` +
          (span > 1 || r.lanes === 1 ? `<span class="meta">${esc(r.c.code)} &middot; ${esc(room)}</span>` : "") +
          (span > 1 ? `<span class="meta">${esc(r.teacher)}</span>` : "") +
          (span > 2 ? `<span class="meta">${periodTime(r.start, r.end)}</span>` : "") +
          `</div>`;
      });
      h += `</div>`;
    });
    $("#grid").innerHTML = h + `</div></div>`;
  }

  /* ---------- Course list ---------- */
  function renderCourses() {
    let groups = GROUPS.filter((g) => !state.group || g.id === state.group);
    let h = "";
    groups.forEach((g) => {
      const courses = g.courses.filter((c) => !state.teacher || c.teacher === state.teacher);
      if (!courses.length) return;
      const rows = courses.map((c) => {
        const runs = toRuns(sessions.filter((s) => s.c === c)).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start - b.start);
        const chips = runs.length
          ? runs.map((r) => `<span class="chip${r.lab ? " lab" : ""}" title="${periodTime(r.start, r.end)}">${r.day} P${r.start === r.end ? r.start : r.start + "-" + r.end}${r.lab ? " lab" : ""}</span>`).join("")
          : `<span class="nofix">No fixed time</span>`;
        return `<tr><td class="code">${esc(c.code)}</td><td><b>${esc(c.title)}</b></td><td title="Credit hours">${esc(c.cr)}</td><td>${chips}</td><td>${esc(c.room || g.room)}</td><td>${esc(c.teacher)}</td></tr>`;
      }).join("");
      h += `<div class="group-block"><h4>${esc(g.label)} <small>Room ${esc(g.room)}${g.rep ? " &middot; Class rep: " + esc(g.rep) : ""}</small></h4>` +
        `<div class="tbl-wrap"><table class="list"><thead><tr><th>Code</th><th>Course</th><th>Cr.Hr</th><th>When</th><th>Room</th><th>Instructor</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    });
    $("#courses").innerHTML = h || `<div class="empty">No courses to show.</div>`;
  }

  function renderSub() {
    const parts = [];
    if (state.group) parts.push(byId[state.group].label);
    else if (state.teacher) parts.push(state.teacher);
    else parts.push("All student groups");
    if (state.day) parts.push(DAY_FULL[state.day]);
    $("#reportSub").textContent = parts.join(" · ");
  }

  /* ---------- Free time slot ---------- */
  const FREE_META = {
    student: { label: "Student group", items: () => GROUPS.map((g) => [g.id, g.label]), match: (s, id) => s.g.id === id, tag: (s) => s.lab ? `${s.c.code}<br>${LAB_ROOM}` : `${s.c.code}<br>${s.room}` },
    teacher: { label: "Teacher", items: () => teachers.map((t) => [t, t]), match: (s, id) => s.teacher === id, tag: (s) => `${s.c.code}<br>${s.g.short}` },
    room: { label: "Room", items: () => rooms.map((r) => [r, r]), match: (s, id) => s.room === id, tag: (s) => `${s.c.code}<br>${s.g.short}` },
  };

  function renderFree() {
    const m = FREE_META[state.free.type];
    const items = m.items();
    if (!items.some(([v]) => v === state.free.id)) state.free.id = items[0][0];
    $("#freeLabel").textContent = m.label;
    $("#freeSel").innerHTML = items.map(([v, t]) => `<option value="${esc(v)}"${v === state.free.id ? " selected" : ""}>${esc(t)}</option>`).join("");
    document.querySelectorAll("#freeTabs .tab").forEach((b) => { const on = b.dataset.type === state.free.type; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });

    const busy = {};
    sessions.filter((s) => m.match(s, state.free.id)).forEach((s) => ((busy[s.day + s.p] ||= []).push(s)));
    let free = 0;
    let h = `<table class="ft"><thead><tr><th></th>${DAYS.map((d) => `<th class="${d === state.day ? "hl" : ""}">${d}</th>`).join("")}</tr></thead><tbody>`;
    for (let p = 1; p <= 8; p++) {
      if (p === 5) h += `<tr><td></td><td class="brkrow" colspan="${DAYS.length}">break</td></tr>`;
      h += `<tr><th class="rowh">P${p} <span class="muted">${PERIODS[p - 1].start}</span></th>`;
      DAYS.forEach((d) => {
        const b = busy[d + p], hl = d === state.day ? " hlc" : "";
        if (!b) { free++; h += `<td class="free${hl}">Free</td>`; }
        else if (b.length > 1) h += `<td class="clash${hl}" title="Double booked">${b.length} clash</td>`;
        else h += `<td class="busy${hl}" title="${esc(b[0].c.title)}">${m.tag(b[0])}</td>`;
      });
      h += `</tr>`;
    }
    $("#freeGrid").innerHTML = h + `</tbody></table>`;
    $("#freeCount").innerHTML = `<b>${free}</b> of ${DAYS.length * 8} periods are free.`;
  }

  $("#freeTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    state.free.type = b.dataset.type; state.free.id = ""; renderFree();
  });
  $("#freeSel").addEventListener("change", (e) => { state.free.id = e.target.value; renderFree(); });

  /* ---------- Calendar ---------- */
  function renderCalendar() {
    const y = state.cal.getFullYear(), mo = state.cal.getMonth();
    $("#monthLabel").textContent = state.cal.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const first = new Date(y, mo, 1).getDay(), count = new Date(y, mo + 1, 0).getDate();
    const counts = {};
    filtered(true).forEach((s) => { if (!counts[s.day]) counts[s.day] = new Set(); counts[s.day].add(s.c.id); });
    let h = JS_DAY.map((d) => `<div class="dow">${d}</div>`).join("");
    for (let i = 0; i < first; i++) h += `<span class="day blank"></span>`;
    for (let d = 1; d <= count; d++) {
      const dt = new Date(y, mo, d), iso = isoDate(dt), name = JS_DAY[dt.getDay()];
      const cls = ["day"];
      const weekend = name === "Sat" || name === "Sun";
      if (weekend) cls.push("off");
      if (EVENTS[iso]) cls.push("event");
      if (iso === isoDate(today)) cls.push("today");
      if (iso === isoDate(state.sel)) cls.push("sel");
      const has = !weekend && counts[name];
      h += `<button type="button" class="${cls.join(" ")}" data-iso="${iso}" aria-label="${dt.toDateString()}${EVENTS[iso] ? ", " + esc(EVENTS[iso]) : ""}" title="${esc(EVENTS[iso] || "")}">${d}${has ? "<i></i>" : ""}</button>`;
    }
    $("#calGrid").innerHTML = h;
    renderDayPanel();
  }

  function renderDayPanel() {
    const d = state.sel, name = JS_DAY[d.getDay()], iso = isoDate(d);
    const title = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    let h = `<h3>${title}</h3>`;
    if (EVENTS[iso]) h += `<p><b>${esc(EVENTS[iso])}</b></p>`;
    const runs = DAYS.includes(name) ? toRuns(filtered(true).filter((s) => s.day === name)).sort((a, b) => a.start - b.start || a.g.id.localeCompare(b.g.id)) : [];
    if (!runs.length) {
      h += `<p class="muted">${DAYS.includes(name) ? "No classes for the current filter." : "No classes on weekends."}</p>`;
    } else {
      h += `<ul>` + runs.map((r) => `<li style="--h:${hueOf(r.c.code)}"><b>${esc(r.c.title)}</b><span>${periodTime(r.start, r.end)} &middot; ${esc(r.lab ? LAB_ROOM : r.room)} &middot; ${esc(r.g.short)} &middot; ${esc(r.teacher)}</span></li>`).join("") + `</ul>`;
    }
    if (DAYS.includes(name) && state.day !== name) h += `<button class="btn btn-ghost small" type="button" id="showDay">Show ${DAY_FULL[name]} in the timetable</button>`;
    $("#dayPanel").innerHTML = h;
    const b = $("#showDay");
    if (b) b.addEventListener("click", () => { state.day = name; update(); $("#report").scrollIntoView({ behavior: "smooth" }); });
  }

  $("#calGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".day[data-iso]"); if (!b) return;
    const [y, m, d] = b.dataset.iso.split("-").map(Number);
    state.sel = new Date(y, m - 1, d); renderCalendar();
  });
  $("#prevM").addEventListener("click", () => { state.cal = new Date(state.cal.getFullYear(), state.cal.getMonth() - 1, 1); renderCalendar(); });
  $("#nextM").addEventListener("click", () => { state.cal = new Date(state.cal.getFullYear(), state.cal.getMonth() + 1, 1); renderCalendar(); });
  $("#todayBtn").addEventListener("click", () => { state.sel = new Date(); state.cal = new Date(today.getFullYear(), today.getMonth(), 1); renderCalendar(); });

  /* ---------- Export, share, theme ---------- */
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("on"), 2200); };

  $("#pdfBtn").addEventListener("click", () => window.print());

  $("#csvBtn").addEventListener("click", () => {
    const runs = toRuns(filtered()).sort((a, b) => a.g.id.localeCompare(b.g.id) || DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start - b.start);
    const rows = [["Group", "Course", "Code", "Day", "Periods", "Time", "Room", "Instructor"]].concat(
      runs.map((r) => [r.g.label, r.c.title, r.c.code, DAY_FULL[r.day], r.start === r.end ? r.start : `${r.start}-${r.end}`, periodTime(r.start, r.end), r.lab ? LAB_ROOM : r.room, r.teacher]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = "class-schedule.csv"; a.click(); URL.revokeObjectURL(a.href);
    toast("CSV downloaded");
  });

  $("#linkBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Link copied"); }
    catch { toast("Copy the address from the browser bar"); }
  });

  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (_) {}
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
  });

  /* ---------- Boot ---------- */
  function update() { syncFilters(); writeHash(); renderSub(); renderGrid(); renderCourses(); renderCalendar(); if (state.free.type) renderFree(); }
  buildFilters();
  update();
})();
