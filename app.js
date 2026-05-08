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
    ["Leg Press",        "3x10-12", "10-20kg"],
    ["Hip Thrust",       "4x8-12",  "5-10kg"],
    ["Leg Curl",         "3x10-12", "8-12kg"],
    ["Abductor",         "3x12-20", "15-25kg"]
  ],
  2: [
    ["Lat Pulldown",     "3x10-12", "11-15kg"],
    ["Seated Row",       "3x10-12", "4.5-8kg"],
    ["Glute Kickback",   "3x12",    "5-10kg"],
    ["Rear Delt Machine","3x12-15", "2.5-5kg"]
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

  let rows = PLAN[currentDay].map((ex, i) => `
    <div class="exercise">
      <h3>${ex[0]}</h3>
      <div class="meta">${ex[1]} · Recommended ${ex[2]}</div>
      <input id="weight_${i}" placeholder="Weight used (kg)" inputmode="decimal">
      <textarea id="note_${i}" placeholder="Notes for yourself 🌸"></textarea>
    </div>
  `).join("");

  card.innerHTML = `
    ${rows}
    <button class="actionBtn" onclick="logSession()">Log Day ${currentDay} Workout ✨</button>
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
    id:       Date.now(),
    day:      currentDay,
    date:     new Date().toLocaleString(),
    exercises: exercises
  };

  data.history.push(session);
  save();
  renderHistory();
  renderChart();

  document.getElementById("logStatus").textContent = "Saved ✨ Proud of you 💗";
  setTimeout(() => {
    document.getElementById("logStatus").textContent = "";
  }, 2000);
}

/* ── Day toggle ── */

document.getElementById("day1Btn").onclick = () => {
  currentDay = 1;
  document.getElementById("day1Btn").classList.add("active");
  document.getElementById("day2Btn").classList.remove("active");
  renderWorkout();
};

document.getElementById("day2Btn").onclick = () => {
  currentDay = 2;
  document.getElementById("day2Btn").classList.add("active");
  document.getElementById("day1Btn").classList.remove("active");
  renderWorkout();
};

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

/* ── Progress chart ── */

let chart;

function renderChart() {
  const select = document.getElementById("exerciseSelect");

  // Build flat list of all exercise names that appear in history
  const allNames = [];
  data.history.forEach(session => {
    session.exercises.forEach(ex => {
      if (!allNames.includes(ex.name)) allNames.push(ex.name);
    });
  });

  select.innerHTML = allNames.length
    ? allNames.map(n => `<option value="${n}">${n}</option>`).join("")
    : `<option value="">No data yet</option>`;

  if (!allNames.length) {
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  const selected = select.value || allNames[0];
  select.value = selected;

  // Collect weight per session for the selected exercise
  const points = [];
  data.history.forEach((session, i) => {
    const match = session.exercises.find(ex => ex.name === selected);
    if (match) {
      const w = parseFloat(match.weight);
      points.push({
        label: `S${i + 1} · ${session.date.split(",")[0]}`,
        value: isNaN(w) ? null : w
      });
    }
  });

  const ctx = document.getElementById("progressChart");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: `${selected} (kg)`,
        data:  points.map(p => p.value),
        tension: 0.35,
        fill: true,
        borderColor: "#e75480",
        backgroundColor: "rgba(231,84,128,0.12)",
        pointBackgroundColor: "#e75480",
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: "kg" }
        }
      }
    }
  });

  select.onchange = renderChart;
}

/* ── Service worker ── */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

/* ── Init ── */

renderWorkout();
renderHistory();
renderChart();
