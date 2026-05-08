const QUOTES = [
  "Proud of you for showing up today 🌸",
  "Small progress is still progress 💗",
  "You are getting stronger every week ✨",
  "Breathe slowly and trust yourself 🌷",
  "You can do much more than you think 💕"
];

document.getElementById("quote").textContent =
  QUOTES[Math.floor(Math.random() * QUOTES.length)];

const PLAN = {
  1: [
    ["Leg Press",         "3x10-12", "10-20kg"],
    ["Hip Thrust",        "4x8-12",  "5-10kg"],
    ["Leg Curl",          "3x10-12", "8-12kg"],
    ["Abductor",          "3x12-20", "15-25kg"]
  ],
  2: [
    ["Lat Pulldown",      "3x10-12", "11-15kg"],
    ["Seated Row",        "3x10-12", "4.5-8kg"],
    ["Glute Kickback",    "3x12",    "5-10kg"],
    ["Rear Delt Machine", "3x12-15", "2.5-5kg"]
  ]
};

let currentDay = 1;
const STORAGE = "mimina_gym_v3";
let data = JSON.parse(localStorage.getItem(STORAGE) || "{}");
if (!data.history) data.history = [];

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

/* ── Workout form ── */

function renderWorkout() {
  const wrap = document.getElementById("workout");
  wrap.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";

  const rows = PLAN[currentDay].map((ex, i) => `
    <div class="exercise">
      <h3>${ex[0]}</h3>
      <div class="meta">${ex[1]} · Recommended ${ex[2]}</div>
      <input id="weight_${i}" placeholder="Weight used (kg)" inputmode="decimal">
      <textarea id="note_${i}" placeholder="Notes for yourself 🌸"></textarea>
    </div>
  `).join("");

  card.innerHTML = `
    ${rows}
    <button class="actionBtn" onclick="logSession()">
      Log Day ${currentDay} Workout ✨
    </button>
    <div id="logStatus" class="logStatus"></div>
  `;

  wrap.appendChild(card);
}

function logSession() {
  const exercises = PLAN[currentDay].map((ex, i) => ({
    name:   ex[0],
    weight: document.getElementById(`weight_${i}`).value.trim(),
    note:   document.getElementById(`note_${i}`).value.trim()
  }));

  const session = {
    id:        Date.now(),
    day:       currentDay,
    date:      new Date().toLocaleString(),
    exercises: exercises
  };

  data.history.push(session);
  save();
  renderHistory();
  renderChart();

  const status = document.getElementById("logStatus");
  status.textContent = "Saved ✨ Proud of you 💗";
  setTimeout(() => { status.textContent = ""; }, 2500);
}

/* ── Day toggle ── */

document.getElementById("day1Btn").addEventListener("click", () => {
  currentDay = 1;
  document.getElementById("day1Btn").classList.add("active");
  document.getElementById("day2Btn").classList.remove("active");
  renderWorkout();
});

document.getElementById("day2Btn").addEventListener("click", () => {
  currentDay = 2;
  document.getElementById("day2Btn").classList.add("active");
  document.getElementById("day1Btn").classList.remove("active");
  renderWorkout();
});

/* ── Rest timer ── */

let timer;

function startTimer(seconds) {
  clearInterval(timer);
  let remaining = seconds;
  updateTimer(remaining);
  timer = setInterval(() => {
    remaining--;
    updateTimer(remaining);
    if (remaining <= 0) {
      clearInterval(timer);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      alert("Rest complete 🌸");
    }
  }, 1000);
}

function updateTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${m}:${s}`;
}

/* ── History ── */

function renderHistory() {
  const h = document.getElementById("history");
  h.innerHTML = "";

  if (!data.history.length) {
    h.innerHTML = `<div class="historyItem"><div class="small">No workouts saved yet.</div></div>`;
    return;
  }

  data.history.slice().reverse().forEach((session, revIdx) => {
    const realIdx = data.history.length - 1 - revIdx;
    const div = document.createElement("div");
    div.className = "historyItem";

    const exRows = session.exercises.map(ex => `
      <div class="historyExRow">
        <span class="historyExName">${ex.name}</span>
        <span class="historyExWeight">${ex.weight ? ex.weight + " kg" : "—"}</span>
        ${ex.note ? `<div class="small historyNote">${ex.note}</div>` : ""}
      </div>
    `).join("");

    div.innerHTML = `
      <div class="historyTop">
        <div>
          <strong>Day ${session.day}</strong>
          <div class="small">${session.date}</div>
        </div>
        <button class="delBtn" onclick="deleteSession(${realIdx})">Delete</button>
      </div>
      <details class="sessionDetails">
        <summary>View exercises (${session.exercises.length})</summary>
        <div class="exList">${exRows}</div>
      </details>
    `;
    h.appendChild(div);
  });
}

function deleteSession(idx) {
  if (!confirm("Delete this workout session?")) return;
  data.history.splice(idx, 1);
  save();
  renderHistory();
  renderChart();
}

/* ── Export / Import backup ── */

function exportBackup() {
  if (!data.history.length) {
    alert("No workout history to export yet 🌸");
    return;
  }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `mimina-gym-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup() {
  const input = document.createElement("input");
  input.type  = "file";
  input.accept = ".json,application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.history || !Array.isArray(parsed.history)) {
          alert("Invalid backup file 🌸");
          return;
        }
        if (!confirm(`Import ${parsed.history.length} session(s)? This will REPLACE your current history.`)) return;
        data = parsed;
        save();
        renderHistory();
        renderChart();
        alert("Backup restored ✨");
      } catch {
        alert("Could not read file. Make sure it is a valid backup 🌸");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ── Progress chart ── */

let chart;
const select = document.getElementById("exerciseSelect");

// Attach onchange ONCE — never overwrite it
select.addEventListener("change", () => renderChart(select.value));

function renderChart(forcedName) {
  const allNames = [];
  data.history.forEach(session => {
    session.exercises.forEach(ex => {
      if (!allNames.includes(ex.name)) allNames.push(ex.name);
    });
  });

  if (!allNames.length) {
    select.innerHTML = `<option value="">No data yet</option>`;
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  // Decide which exercise to show
  const selected = (forcedName && allNames.includes(forcedName))
    ? forcedName
    : (allNames.includes(select.value) ? select.value : allNames[0]);

  // Rebuild options, marking the selected one
  select.innerHTML = allNames
    .map(n => `<option value="${n}"${n === selected ? " selected" : ""}>${n}</option>`)
    .join("");

  // Gather data points
  const points = [];
  data.history.forEach((session, i) => {
    const match = session.exercises.find(ex => ex.name === selected);
    if (match) {
      const w = parseFloat(match.weight);
      points.push({
        label: `S${i + 1} (${session.date.split(",")[0]})`,
        value: isNaN(w) ? null : w
      });
    }
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("progressChart"), {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label:              `${selected} (kg)`,
        data:               points.map(p => p.value),
        tension:            0.35,
        fill:               true,
        borderColor:        "#e75480",
        backgroundColor:    "rgba(231,84,128,0.12)",
        pointBackgroundColor: "#e75480",
        pointRadius:        5,
        spanGaps:           true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: "kg" }
        }
      }
    }
  });
}

/* ── Service worker ── */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

/* ── Init ── */

renderWorkout();
renderHistory();
renderChart();
