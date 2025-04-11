// Welcome Banner
function showWelcomeBanner() {
    if(!sessionStorage.getItem("welcomeShow")) {
        const banner = document.getElementById("welcomeBanner");
        banner.style.opacity = "1";
        setTimeout(() => {
            banner.style.opacity = "0";
        }, 3000);
        sessionStorage.setItem("welcomeShow", "true");
     }
}

// Phone Book Toggle
document.getElementById("phoneBookBtn").addEventListener("click", () => {
  const panel = document.getElementById("phoneBookPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

window.onload = showWelcomeBanner;

// Digital Clock
function updateClock() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let seconds = now.getSeconds().toString().padStart(2, "0");

    document.getElementById("digitalClock").textContent = `${hours}:${minutes}:${seconds}`;
}

// Analog Clock
function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Digital
    document.getElementById("digitalClock").textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Angle calculations (with -90° to align 0° to top)
    const hourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30 - 90;
    const minuteDeg = (minutes + seconds / 60) * 6 - 90;
    const secondDeg = seconds * 6 - 90;

    document.querySelector(".hour").style.transform = `rotate(${hourDeg}deg)`;
    document.querySelector(".minute").style.transform = `rotate(${minuteDeg}deg)`;
    document.querySelector(".second").style.transform = `rotate(${secondDeg}deg)`;
}

setInterval(updateClock, 1000);

// Notepad Persistence
document.getElementById("notepad").value = localStorage.getItem("notes") || "";
document.getElementById("notepad").addEventListener("input", () => {
    localStorage.setItem("notes", document.getElementById("notepad").value);
});
document.getElementById("clearNotes").addEventListener("click", () => {
    document.getElementById("notepad").value = "";
    localStorage.removeItem("notes");
});

// Break Time Button Logic
document.getElementById("breakTimeBtn").addEventListener("click", function () {
    let confirmBreak = confirm("🚨 This section is for break time only! No responsibility will fall on me if used during work hours.\n\nDo you want to continue?");
    if (confirmBreak) {
        document.getElementById("gamePanel").classList.add("open");
    }
});

// Close Break Mode
document.getElementById("breakOverBtn").addEventListener("click", function () {
    document.getElementById("gamePanel").classList.remove("open");
});

//iFrame refresh
setInterval(() => {
    const iframe = document.getElementById("refreshFrame");
    const baseUrl = "http://automonweb/automationmonitor/default.aspx?area=metrology";
    iframe.src = `${baseUrl}&t=${new Date().getTime()}`;
}, 10000);

function getQuotePhase(hour) {
  if (hour >= 8 && hour < 11) return "startMorning";
  if (hour >= 11 && hour < 15) return "middleMorning";
  if (hour >= 15 && hour < 20) return "endMorning";
  if (hour >= 20 && hour < 24) return "startNight";
  if (hour >= 0 && hour < 4) return "middleNight";
  if (hour >= 4 && hour < 8) return "endNight";
  console.log(hour);
  return null;
}

function getQuoteFile(day) {
  if (day <= 10) return "data/startOfMonth.js";
  if (day <= 20) return "data/startOfMonth.js";
  return "data/startOfMonth.js";
}

function updateVisuals() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Sun/Moon position
  const percentAcross = hour / 23;
  const sky = document.querySelector(".sky-bar");
  const container = document.getElementById("sunMoonContainer");
  const maxWidth = sky.offsetWidth - 24;
  container.style.left = `${percentAcross * maxWidth}px`;

  const isDay = hour >= 8 && hour < 20;
  document.getElementById("sunIcon").style.display = isDay ? "block" : "none";
  document.getElementById("moonIcon").style.display = isDay ? "none" : "block";

  // Shift Progress (08:00–20:00 or 20:00–08:00)
  let shiftStart = new Date(now);
  let shiftEnd = new Date(now);

  if (isDay) {
    shiftStart.setHours(8, 0, 0, 0);
    shiftEnd.setHours(20, 0, 0, 0);
  } else {
    if (hour >= 20) {
      shiftStart.setHours(20, 0, 0, 0);
      shiftEnd.setDate(shiftEnd.getDate() + 1);
      shiftEnd.setHours(8, 0, 0, 0);
    } else {
      shiftEnd.setHours(8, 0, 0, 0);
      shiftStart.setDate(shiftStart.getDate() - 1);
      shiftStart.setHours(20, 0, 0, 0);
    }
  


  const totalShift = shiftEnd - shiftStart;
  const elapsed = now - shiftStart;
  const progress = Math.min(100, Math.max(0, (elapsed / totalShift) * 100));
  document.getElementById("shiftProgress").style.width = `${progress}%`;
}

  let progress = 0;
  if (now >= shiftStart && now <= shiftEnd) {
    progress = ((now - shiftStart) / (shiftEnd - shiftStart)) * 100;
  } else if (now > shiftEnd) {
    progress = 100;
  }

  document.getElementById("shiftProgress").style.width = `${progress}%`;
  document.getElementById("shiftPercentage").textContent = `${progress.toFixed(1)}% of shift complete`;
}

function loadQuotes(callback) {
    const today = new Date();
    const day = today.getDate();
    const hour = today.getHours();
    const phase = getQuotePhase(hour);
    const quoteFile = getQuoteFile(day);

    const script = document.createElement("script");
    script.src = quoteFile;
    script.onload = () => {
        if (typeof quotes === "object" && quotes[phase]) {
            const quoteList = quotes[phase];

            const index = (day + phase.length) % quoteList.length;

            const selected = quoteList[index];
            document.getElementById("quoteBox").textContent = selected;
        } else {
            document.getElementById("quoteBox").textContent = "No quotes available.";
        }
        if (callback) callback();
    };
    script.onerror = () => {
        document.getElementById("quoteBox").textContent = "Failed to load quotes.";
    };
    document.head.appendChild(script);
}

// SHIFT CALENDAR LOGIC
const baseDate = new Date(2025,3,6);

// 28-day (4-week) shift pattern
const shiftPattern = [
  // Week 1
  ["S3:D", "S4:N"], ["S3:D", "S4:N"], ["S1:D", "S2:N"], ["S1:D", "S2:N"], ["S1:D", "S2:N"], ["S3:N", "S4:D"], ["S3:N", "S4:D"],
  // Week 2
  ["S2:D", "S1:N"], ["S2:D", "S1:N"], ["S3:D", "S4:N"], ["S3:D", "S4:N"], ["S3:D", "S4:N"], ["S2:N", "S1:D"], ["S2:N", "S1:D"],
  // Week 3
  ["S4:D", "S3:N"], ["S4:D", "S3:N"], ["S2:D", "S1:N"], ["S2:D", "S1:N"], ["S2:D", "S1:N"], ["S4:N", "S3:D"], ["S4:N", "S3:D"],
  // Week 4
  ["S1:D", "S2:N"], ["S1:D", "S2:N"], ["S4:D", "S3:N"], ["S4:D", "S3:N"], ["S4:D", "S3:N"], ["S1:N", "S2:D"], ["S1:N", "S2:D"]
];

function getShiftAssignments(date) {
  const daysSinceBase = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
  const dayIndex = ((daysSinceBase % 28) + 28) % 28;
  const assignments = shiftPattern[dayIndex] || [];

  const day = assignments.filter(a => a.includes(":D")).map(a => a.split(":")[0]);
  const night = assignments.filter(a => a.includes(":N")).map(a => a.split(":")[0]);

  return {
    day: day.join(", ") || "-",
    night: night.join(", ") || "-"
  };
}

// CALENDAR RENDERING
const calendarTable = document.getElementById("shiftCalendarTable");
const monthYearLabel = document.getElementById("calendarMonthYear");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const shiftSelector = document.getElementById("shiftSelector");

let currentDate = new Date();

function renderShiftCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const selectedShift = `S${shiftSelector.value}`;

  monthYearLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${year}`;
  let html = "<tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr><tr>";

  for (let i = 0; i < startDay; i++) html += "<td></td>";

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const cellDate = new Date(year, month, d);
    const { day, night } = getShiftAssignments(cellDate);
    const isToday = cellDate.toDateString() === today.toDateString();
    const isHighlighted = day.includes(selectedShift) || night.includes(selectedShift);
    const cls = (isToday ? "today " : "") + (isHighlighted ? "shift-highlight" : "");

    html += `<td class="${cls}"><strong>${d}</strong><br><small>D: ${day}</small><br><small>N: ${night}</small></td>`;
    if ((startDay + d) % 7 === 0) html += "</tr><tr>";
  }

  html += "</tr>";
  calendarTable.innerHTML = html;
}

// BUTTON & SELECT EVENTS
prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderShiftCalendar(currentDate);
};

nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderShiftCalendar(currentDate);
};

shiftSelector.addEventListener("change", () => {
  renderShiftCalendar(currentDate);
});

document.getElementById("shiftCalendarBtn").addEventListener("click", () => {
  const panel = document.getElementById("shiftCalendarPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

// INITIAL RENDER
renderShiftCalendar(currentDate);



// Initialize everything
setInterval(() => {
  updateVisuals();
  loadQuotes();
}, 60000);

window.addEventListener("load", () => {
  updateVisuals();
  loadQuotes();
});