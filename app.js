const QUOTES = [
  "Proud of you for showing up today 🌸",
  "Small progress is still progress 💗",
  "You are getting stronger every week ✨",
  "Breathe slowly and trust yourself 🌷",
  "You can do much more than you think 💕"
];

document.getElementById("quote").textContent =
  QUOTES[Math.floor(Math.random()*QUOTES.length)];

const PLAN = {

  1:[
    ["Leg Press","3x10-12","10-20kg"],
    ["Hip Thrust","4x8-12","5-10kg"],
    ["Leg Curl","3x10-12","8-12kg"],
    ["Abductor","3x12-20","15-25kg"]
  ],

  2:[
    ["Lat Pulldown","3x10-12","11-15kg"],
    ["Seated Row","3x10-12","4.5-8kg"],
    ["Glute Kickback","3x12","5-10kg"],
    ["Rear Delt Machine","3x12-15","2.5-5kg"]
  ]
};

let currentDay = 1;

const STORAGE = "mimina_gym_v2";

let data = JSON.parse(localStorage.getItem(STORAGE) || "{}");

if(!data.history){
  data.history = [];
}

function save(){
  localStorage.setItem(STORAGE,JSON.stringify(data));
}

function renderWorkout(){

  const wrap =
    document.getElementById("workout");

  wrap.innerHTML = "";

  PLAN[currentDay].forEach((ex,i)=>{

    const div =
      document.createElement("div");

    div.className = "exercise";

    div.innerHTML = `
      <h3>${ex[0]}</h3>

      <div class="meta">
        ${ex[1]} · Recommended ${ex[2]}
      </div>

      <input
        id="weight_${i}"
        placeholder="Weight used">

      <textarea
        id="note_${i}"
        placeholder="Notes for yourself 🌸"></textarea>

      <button
        class="actionBtn"
        onclick="completeExercise(${i})">

        Save Exercise ✨

      </button>
    `;

    wrap.appendChild(div);
  });
}

function completeExercise(i){

  const ex = PLAN[currentDay][i];

  const weight =
    document.getElementById(`weight_${i}`).value;

  const note =
    document.getElementById(`note_${i}`).value;

  data.history.push({
    exercise:ex[0],
    weight,
    note,
    date:new Date().toLocaleString()
  });

  save();

  renderHistory();

  renderChart();

  setTimeout(()=>{

    alert(
      "Workout saved ✨\nProud of you 💗"
    );

  },200);
}

document.getElementById("day1Btn").onclick = ()=>{

  currentDay = 1;

  document.getElementById("day1Btn")
    .classList.add("active");

  document.getElementById("day2Btn")
    .classList.remove("active");

  renderWorkout();
};

document.getElementById("day2Btn").onclick = ()=>{

  currentDay = 2;

  document.getElementById("day2Btn")
    .classList.add("active");

  document.getElementById("day1Btn")
    .classList.remove("active");

  renderWorkout();
};

let timer;

function startTimer(seconds){

  clearInterval(timer);

  let remaining = seconds;

  updateTimer(remaining);

  timer = setInterval(()=>{

    remaining--;

    updateTimer(remaining);

    if(remaining <= 0){

      clearInterval(timer);

      if(navigator.vibrate){
        navigator.vibrate([200,100,200]);
      }

      alert("Rest complete 🌸");
    }

  },1000);
}

function updateTimer(sec){

  const m =
    String(Math.floor(sec/60)).padStart(2,"0");

  const s =
    String(sec%60).padStart(2,"0");

  document.getElementById("timerDisplay")
    .textContent = `${m}:${s}`;
}

function renderHistory(){

  const h =
    document.getElementById("history");

  h.innerHTML = "";

  data.history
    .slice()
    .reverse()
    .forEach(e=>{

      const div =
        document.createElement("div");

      div.className = "historyItem";

      div.innerHTML = `
        <strong>${e.exercise}</strong>

        <div class="small">
          ${e.weight} · ${e.date}
        </div>

        <div class="small">
          ${e.note || ""}
        </div>
      `;

      h.appendChild(div);
    });
}

let chart;

function renderChart(){

  const select =
    document.getElementById("exerciseSelect");

  const exercises =
    [...new Set(data.history.map(x=>x.exercise))];

  select.innerHTML = exercises
    .map(e=>`<option>${e}</option>`)
    .join("");

  if(!exercises.length) return;

  const selected =
    select.value || exercises[0];

  const logs =
    data.history.filter(x=>x.exercise===selected);

  const ctx =
    document.getElementById("progressChart");

  if(chart) chart.destroy();

  chart = new Chart(ctx,{

    type:"line",

    data:{
      labels:logs.map((_,i)=>`#${i+1}`),

      datasets:[{
        label:selected,
        data:logs.map(x=>x.weight),
        tension:.35
      }]
    }
  });

  select.onchange = renderChart;
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

renderWorkout();
renderHistory();
renderChart();
