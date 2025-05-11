let currentRace;
let isUpdated = true;
class Runner {
  constructor(fname, lname, position, time, runnerId) {
    this.fname = fname;
    this.lname = lname;
    this.position = position;
    this.time = time;
    this.runnerId = runnerId;
  }

  toJSON() {
    return {
      fname: this.fname,
      lname: this.lname,
      position: this.position,
      time: this.time,
      runnerId: this.runnerId,
    };
  }
}


class Positions {
  constructor(raceId, runnerId, time, position) {
    this.raceId = raceId;
    this.runnerId = runnerId;
    this.time = time;
    this.position = position;
  }

  toJSON() {
    return {
      raceId: this.raceId,
      runnerID: this.runnerId,
      time: this.time,
      position: this.position,
    };
  }
}
function goBack() {
  window.location.href = "index.html";
}
function changesMade() {
  document.getElementById("saveRaceButt").style.display = "block";
  document.getElementById("revertChangesButt").style.display = "block";
  document.getElementById("race-name").style.display = "block";
}
function resetChanges() {
  document.getElementById("saveRaceButt").style.display = "none";
  document.getElementById("revertChangesButt").style.display = "none";
}
function retrieveLocalRaces() {
  const races = JSON.parse(localStorage.getItem("offlineRaces")) || [];
  return races;
}
function generateRunnerList() {
  const tableBody = document.getElementById("race-results");
  const rows = tableBody.getElementsByTagName("tr");
  const runnerList = [];
  for (let i = 1; i < rows.length; i += 2) {
    const row = rows[i];
    const positionCell = row.getElementsByTagName("td")[0];
    const timeCell = row.getElementsByTagName("td")[1];
    const hiddenRow = row.nextElementSibling;
    const fname = hiddenRow.getElementsByTagName("input")[0].value;
    const lname = hiddenRow.getElementsByTagName("input")[1].value;
    const position = parseInt(positionCell.textContent);
    const time = timeCell.textContent;
    const runnerId = hiddenRow.getElementsByTagName("span")[0].value;
    const runner = new Runner(fname, lname, position, time, runnerId);
    runnerList.push(runner);
  }

  return runnerList;
}
function calculateTimeDiff(startTimeISO) {
  const now = new Date();
  const startTime = new Date(startTimeISO);

  let diffInMs = now - startTime;
  let countdown = Math.max(-diffInMs, 0);
  let timer = Math.max(diffInMs, 0);

  return { timer, countdown };
}
function toggleSaveIcon(onOff) {
  if (onOff) {
    document.getElementById("save-status").classList.remove("not-saved");
    document.getElementById("save-status").classList.add("saved");
    document.getElementById("status-icon").innerHTML = "✔";
    document.getElementById("status-text").innerText = "Race Online";
  } else {
    document.getElementById("save-status").classList.remove("saved");
    document.getElementById("save-status").classList.add("not-saved");
    document.getElementById("status-icon").innerHTML = "❌";
    document.getElementById("status-text").innerText = "Race Offline";
  }
}
function updateChecker() {
  console.log("Online");
  if (!isUpdated) {
    
    if (navigator.onLine) {
      
      saveWholeRace();


      console.log("Back Online, saving Race");
      isUpdated = true;
      toggleSaveIcon(true);
      return;
    }
    toggleSaveIcon(false);
    return;
  }
  toggleSaveIcon(true);
  return;
}
function log(msg) {
  const logDiv = document.getElementById("log");
  logDiv.innerText += msg + "\n";
}
async function saveWholeRace() {
  resetChanges();
  const raceCode = currentRace.raceCode;
  const startTimeDate = currentRace.startTimeDate;
  const runners = generateRunnerList().map((runner) => runner.toJSON());
  const ended = currentRace.ended;
  let raceName = document.getElementById("race-name").value;
  if (raceName === "Unnamed") {
    raceName = "";
  }
  isUpdated = false;
  if (currentRace.ended !== 1) {
    if (calculateTimeDiff(currentRace.startTimeDate).timer > 864000000) {
      currentRace.ended = 1;
    }
  }

  try {
    if (!navigator.onLine) {
      throw new Error("Offline mode detected. Saving locally.");
    }
    const response = await fetch("/api/races/saveEntireRace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raceCode,
        startTimeDate,
        runners,
        ended,
        raceName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save race");
    }
    const data = await response.json();
    saveRaceLocal(raceCode, data.runnerIds);
    viewRace(currentRace.raceCode);
    setRunnerIds(data.runnerIds);
    isUpdated = true;
    log("saved");
    if (raceName !== "") {
      generateRaceListHTML();
    }
  } catch (error) {
    let runnerIds = [];
    for (let i = 0; i < runners.length; i++) {
      runnerIds.push(runners[i].runnerId);
    }
    log("save Failed");
    saveRaceLocal(raceCode, runnerIds);
    viewRace(currentRace.raceCode);
    setRunnerIds(runnerIds);
    if (raceName !== "") {
      generateRaceListHTML();
    }
    isUpdated = false;
    console.error("Error saving race:", error);
  }
}

async function saveRaceLocal(raceCode, runnerIds) {
  let races = retrieveLocalRaces();
  let raceName = document.getElementById("race-name").value;
  let newRace = races.find(
    (existingRace) => existingRace.raceCode === raceCode
  );
  const runners = generateRunnerList();
  for (let i = 0; i < runners.length; i++) {
    runners[i].runnerId = runnerIds[i];
  }
  if (newRace) {
    newRace.raceName = raceName;
    newRace.runners = runners;
  }

  localStorage.setItem("offlineRaces", JSON.stringify(races));
}
function setRunnerIds(runnerIds) {
  const tableBody = document.getElementById("race-results");
  const rows = tableBody.getElementsByTagName("tr");
  let idIndex = 0;

  for (let i = 1; i < rows.length; i += 2) {
    const hiddenRow = rows[i].nextElementSibling;
    if (hiddenRow) {
      const runnerIdInput = hiddenRow.getElementsByTagName("span")[0];
      if (runnerIdInput && idIndex < runnerIds.length) {
        runnerIdInput.value = runnerIds[idIndex];
        idIndex++;
      }
    }
  }
}
function generateRaceListHTML() {
  let races = retrieveLocalRaces();
  const testRace = {
    raceName: "Test Race",
    raceCode: "1111111111",
    startTimeDate: new Date().toISOString(),
    ended: 0,
    runners: [
      new Runner("John", "Doe", 1, "00:30:00", 1),
      new Runner("Jane", "Smith", 2, "00:35:00", 2),
    ],
    positions: [
      new Positions(1, 1, "00:30:00", 1),
      new Positions(2, 2, "00:35:00", 2),
    ],
  };

  races.push(testRace);
  const raceListContainer = document.getElementById("raceList");

  raceListContainer.innerHTML = "";

  if (races.length === 0) {
    raceListContainer.innerHTML = "<p>No offline races found.</p>";
    return;
  }

  const scrollableDiv = document.createElement("div");
  scrollableDiv.classList.add("scrollable-race-list");

  races.forEach((race) => {
    const raceCard = document.createElement("div");
    raceCard.classList.add("race-card");

    raceCard.innerHTML = `
            <h3 class="race-title">${race.raceName || "Unnamed Race"}</h3>
            <p class="race-code"><strong>Code:</strong> ${
              race.raceCode || "N/A"
            }</p>
            <p class="race-start-time"><strong>Start Time:</strong> ${
              race.startTimeDate
                ? new Date(race.startTimeDate).toLocaleString()
                : "N/A"
            }</p>
            <button class="view-race-button" onclick="viewRace('${
              race.raceCode
            }')">View</button>
        `;

    scrollableDiv.appendChild(raceCard);
  });

  raceListContainer.appendChild(scrollableDiv);
}
async function viewRace(raceCode) {
  isUpdated = false;
  try {
    let races = retrieveLocalRaces();
    const testRace = {
      raceName: "Test Race",
      raceCode: "1111111111",
      startTimeDate: new Date().toISOString(),
      ended: 0,
      runners: [
        new Runner("John", "Doe", 1, "00:30:00", 1),
        new Runner("Jane", "Smith", 2, "00:35:00", 2),
      ],
      positions: [
        new Positions(1, 1, "00:30:00", 1),
        new Positions(2, 2, "00:35:00", 2),
      ],
    };
    races.push(testRace);
    let race = races.find((rC) => rC.raceCode === raceCode);
    if (!race) {
      document.getElementById("race-name").style.display = "none";
      document.getElementById("save-status").style.display = "none";
      const tableBody = document.querySelector("#race-results tbody");
      document.getElementById("race-name").style.display = "none";
      tableBody.innerHTML = "";
      return;
    }
    document.getElementById("race-name").style.display = "block";
    document.getElementById("save-status").style.display = "block";
    document.getElementById("race-name").style.display = "block";
    document.getElementById("race-name").value = race.raceName || "Unnamed";
    const raceResults = race.runners || [];
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = "";

    raceResults.forEach((runner, index) => {
      let row = document.createElement("tr");
      let position = index + 1;
      let positionClass = "";

      if (position === 1) {
        positionClass = "gold";
      } else if (position === 2) {
        positionClass = "silver";
      } else if (position === 3) {
        positionClass = "bronze";
      } else {
        positionClass = "standard";
      }

      row.classList.add(positionClass);
      row.innerHTML = `
                <td>${position}</td>
                <td>${runner.time}</td>
            `;

      tableBody.appendChild(row);

      const hiddenRow = document.createElement("tr");
      hiddenRow.innerHTML = `
                <td colspan="3">
                    <p><strong>Runner ID:</strong> <span>${
                      runner.runnerId || "N/A"
                    }</span></p>
                    <p><strong>First Name:</strong> <input type="text" id="fname-${
                      runner.runnerId
                    }" value="${
        runner.fname || ""
      }" onInput=changesMade(this)></p>
                    <p><strong>Last Name:</strong> <input type="text" id="lname-${
                      runner.runnerId
                    }" value="${
        runner.lname || ""
      }" onInput=changesMade(this)></p>
                    <button class="pill-button" data-position="${position}">Remove</button>
                </td>
            `;
      hiddenRow.classList.add("hidden-row");
      const removeButton = hiddenRow.querySelector(".pill-button");
      removeButton.addEventListener("click", function () {
        removePosition(this.dataset.position);
      });
      tableBody.appendChild(hiddenRow);

      row.addEventListener("click", () => {
        hiddenRow.classList.toggle("visible-row");
      });
    });
    if (navigator.onLine) {
      try {
        const response = await fetch(`/api/races/${raceCode}/marshalls`);
        if (!response.ok) {
          console.error(
            `Failed to fetch marshalls (status: ${response.status})`
          );
        } else {
          const marshallsData = await response.json();
          renderMarshalls(marshallsData);
        }
      } catch (fetchError) {
        console.error("Error fetching marshalls:", fetchError);
      }
    } else {
      console.log("Offline: skipping marshalls fetch");
    }
    currentRace = race;
  } catch (error) {
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = "";
    console.error("Error fetching race data:", error);
  }
}

function removePosition(position) {
  changesMade();
  const tableBody = document.querySelector("#race-results tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  let found = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const positionCell = row.querySelector("td:first-child");

    if (positionCell && positionCell.textContent.trim() === position) {
      tableBody.removeChild(row);
      if (rows[i + 1] && rows[i + 1].classList.contains("hidden-row")) {
        tableBody.removeChild(rows[i + 1]);
      }
      found = true;
      break;
    }
  }

  if (found) {
    updatePositions();
  }
}

function updatePositions() {
  const tableBody = document.querySelector("#race-results tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr:not(.hidden-row)"));

  rows.forEach((row, index) => {
    const positionCell = row.querySelector("td:first-child");
    if (positionCell) {
      const position = index + 1;
      positionCell.textContent = position;

      row.classList.remove("gold", "silver", "bronze", "standard");

      if (position === 1) {
        row.classList.add("gold");
      } else if (position === 2) {
        row.classList.add("silver");
      } else if (position === 3) {
        row.classList.add("bronze");
      } else {
        row.classList.add("standard");
      }
    }
  });
}

function clearLocalRaces() {
  localStorage.clear("offlineRaces");
  generateRaceListHTML();
  viewRace("");
}
function createRace() {
  window.location.href = "newCreateRace.html";
}
function downloadCSV() {
  const runners = generateRunnerList();
  const csvRows = [
    ["First Name", "Last Name", "Position", "Time", "Runner ID"],
  ];

  runners.forEach((runner) => {
    csvRows.push([
      runner.fname,
      runner.lname,
      runner.position,
      runner.time,
      runner.runnerId,
    ]);
  });

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${
    document.getElementById("race-name").value.replace(/\s+/g, "_") || "Unnamed"
  }_Results.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function renderMarshalls(marshalls) {
  const confirmedContainer = document.getElementById("confirmedMarshalls");
  const requestedContainer = document.getElementById("requestedMarshalls");
  confirmedContainer.innerHTML = "";
  requestedContainer.innerHTML = "";

  const confirmed = marshalls.filter((m) => m.confirmed === 1);
  const requested = marshalls.filter((m) => m.confirmed === 0);

  if (confirmed.length > 0) {
    for (const marshall of confirmed) {
      const entry = await createMarshallEntry(marshall);
      confirmedContainer.appendChild(entry);
    }
  } else {
    const noConfirmed = document.createElement("div");
    noConfirmed.className = "no-marshall";
    noConfirmed.innerHTML = "<strong>No Marshalls.</strong>";
    confirmedContainer.appendChild(noConfirmed);
  }

  if (requested.length > 0) {
    for (const marshall of requested) {
      const entry = await createMarshallEntry(marshall);
      requestedContainer.appendChild(entry);
    }
  } else {
    const noRequested = document.createElement("div");
    noRequested.className = "no-marshall";
    noRequested.innerHTML = "<strong>No requests.</strong>";
    requestedContainer.appendChild(noRequested);
  }
}


async function fetchMarshallInputs(marshalId) {
  try {
    const response = await fetch(`/api/marshall-inputs/${marshalId}`);
    const inputs = await response.json();

    if (response.ok) {
      return inputs;
    } else {
      console.error("Failed to fetch inputs:", inputs.error);
    }
  } catch (error) {
    console.error("Error fetching inputs:", error);
  }
}
async function createMarshallEntry(marshall) {
  const entry = document.createElement("div");
  entry.className = "marshall-entry";

  const toggle = document.createElement("button");
  toggle.className = "marshall-toggle";
  toggle.textContent = `${marshall.name} (${marshall.checkpointName}) - ↓`;

  const details = document.createElement("div");
  details.className = "marshall-details";
  details.style.display = "none";

  const runners = await fetchMarshallInputs(marshall.marshalId);

  const numRunners = runners.length;
  if (numRunners > 1) {
    const times = runners.map((date) => new Date(date).getTime());
    times.sort((a, b) => a - b);
  }
  if (marshall.confirmed === 0) {
    details.innerHTML = `
    <p><strong>Marshall ID:</strong> ${marshall.marshalId}</p>
    <p><strong>Checkpoint:</strong> ${marshall.checkpointName}</p>
    <p><strong>Distance:</strong> ${marshall.distance} km</p>
    <p><strong>Runners Recorded:</strong> ${numRunners}</p>
    <section class="graph-container">
      <canvas class="marshall-graph"></canvas>
    </section>
    <button class="pill-button" onclick="confirmMarshall(${marshall.marshalId})">Confirm</button>
    <button class="pill-button" onclick="declineMarshall(${marshall.marshalId})">Decline</button>

  `;
  } else {
    details.innerHTML = `
    <p><strong>Marshall ID:</strong> ${marshall.marshalId}</p>
    <p><strong>Checkpoint:</strong> ${marshall.checkpointName}</p>
    <p><strong>Distance:</strong> ${marshall.distance} km</p>
    <p><strong>Runners Recorded:</strong> ${numRunners}</p>
    <section class="graph-container">
      <canvas class="marshall-graph"></canvas>
    </section>
  `;
  }

  toggle.addEventListener("click", () => {
    details.style.display =
      details.style.display === "block" ? "none" : "block";
  });

  entry.appendChild(toggle);
  entry.appendChild(details);

  setTimeout(
    () => drawGraph(details.querySelector(".marshall-graph"), runners),
    50
  );
  return entry;
}

async function confirmMarshall(id) {
  try {
    const response = await fetch(`/api/marshall/${id}/confirm`, {
      method: "POST",
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);

      viewRace(currentRace.raceCode);
    }
  } catch (error) {
    console.error("Error confirming marshall:", error);
  }
}

async function declineMarshall(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this marshall and their inputs?"
  );
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/marshall/${id}`, {
      method: "POST",
    });

    const result = await response.json();
    if (response.ok) {
      viewRace(currentRace.raceCode);
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting marshall:", error);
  }
}
function drawGraph(canvas, runners) {
  if (!canvas || runners.length === 0) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 150;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const times = runners.map((r) => new Date(r.time).getTime());
  times.sort((a, b) => a - b);

  const minTime = times[0];
  const maxTime = times[times.length - 1];

  const interval = 10 * 60 * 1000;
  const binCount = Math.ceil((maxTime - minTime) / interval) + 1;

  const bins = new Array(binCount).fill(0);

  times.forEach((time) => {
    const binIndex = Math.floor((time - minTime) / interval);
    bins[binIndex]++;
  });

  const barWidth = canvas.width / bins.length;

  const maxRunners = Math.max(...bins) || 1;

  ctx.fillStyle = "#ff6f61";
  bins.forEach((count, index) => {
    const barHeight = (count / maxRunners) * canvas.height;
    const x = index * barWidth;
    const y = canvas.height - barHeight;
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  });

  ctx.fillStyle = "#000";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";

  bins.forEach((_, index) => {
    const timeLabel = new Date(minTime + index * interval);
    const hours = timeLabel.getHours().toString().padStart(2, "0");
    const minutes = timeLabel.getMinutes().toString().padStart(2, "0");
    const label = `${hours}:${minutes}`;
    const x = index * barWidth + barWidth / 2;
    ctx.fillText(label, x, canvas.height - 2);
  });
}

function attachEventHandles() {
  generateRaceListHTML();
  const updater = setInterval(updateChecker, 1000);
  document
    .getElementById("createRaceButt")
    .addEventListener("click", createRace);
  document.getElementById("backButt").addEventListener("click", goBack);
  document
    .getElementById("clearButt")
    .addEventListener("click", clearLocalRaces);
  document
    .getElementById("revertChangesButt")
    .addEventListener("click", () => viewRace(currentRace.raceCode));
  document
    .getElementById("saveRaceButt")
    .addEventListener("click", saveWholeRace);
  document.getElementById("race-name").style.display = "none";
  document.getElementById("save-status").style.display = "none";
  document.getElementById("saveRaceButt").style.display = "none";
  document.getElementById("revertChangesButt").style.display = "none";
  document.getElementById("race-name").style.display = "none";
  document.getElementById("race-name").addEventListener("input", changesMade);
  document
    .getElementById("downloadCsvBtn")
    .addEventListener("click", downloadCSV);
}

document.addEventListener("DOMContentLoaded", attachEventHandles);
