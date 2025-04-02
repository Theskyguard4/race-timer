let changesMade = false;
let currentRaceCode = "";
let currentStartTime = "";
let currentRace;
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

class Race {
  constructor(raceId, raceName, raceCode, startTimeDate, ended) {
    this.raceId = raceId; 
    this.raceName = raceName;
    this.raceCode = raceCode;
    this.startTimeDate = startTimeDate; 
    this.ended = ended; 
    this.runners = [];
    this.positions = [];
  }

  toJSON() {
    return {
      raceId: this.raceId,
      raceName: this.raceName,
      raceCode: this.raceCode,
      startTimeDate: this.startTimeDate,
      ended: this.ended,
      runners: this.runners,
      positions: this.positions,
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
function goBack(event) {
  window.location.href = "index.html";
}
function detectChanges(event) {
  document.getElementById("saveRaceButt").style.display = "block";
  document.getElementById("revertChangesButt").style.display = "block";
}
function noChanges() {
  document.getElementById("saveRaceButt").style.display = "none";
  document.getElementById("revertChangesButt").style.display = "none";
}
function getStoredRaces() {
  const races = JSON.parse(localStorage.getItem("offlineRaces")) || [];
  return races;
}
function createRunnerList() {
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
function getTimeDifferences(startTimeISO) {
  const now = new Date();
  const startTime = new Date(startTimeISO);

  let diffInMs = now - startTime; // Difference in milliseconds
  let countdown = Math.max(-diffInMs, 0); // Countdown (positive, 0 if race started)
  let timer = Math.max(diffInMs, 0); // Timer (positive, 0 if race hasn't started)

  return { timer, countdown };
}
async function saveWholeRace() {
  noChanges();
  const raceCode = currentRace.raceCode;
  const startTimeDate = currentRace.startTimeDate;
  const runners = createRunnerList().map((runner) => runner.toJSON()); // Convert runners to JSON format
  const ended = currentRace.ended;
  if (currentRace.ended !== 1) {
    if (getTimeDifferences(currentRace.startTimeDate).timer > 864000000) {
      currentRace.ended = 1;
    }
  }
  try {
    const response = await fetch("/api/races/saveEntireRace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raceCode, startTimeDate, runners, ended }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save race");
    }
    const data = await response.json();
    viewRace(currentRace.raceCode);
    setRunnerIds(data.runnerIds);
  } catch (error) {
    console.error("Error saving race:", error);
  }
}
function setRunnerIds(runnerIds) {
  const tableBody = document.getElementById("race-results");
  const rows = tableBody.getElementsByTagName("tr");
  let idIndex = 0;

  for (let i = 1; i < rows.length; i += 2) {
    const hiddenRow = rows[i].nextElementSibling;
    if (hiddenRow) {
      const runnerIdInput = hiddenRow.getElementsByTagName("span")[0]; // Assuming runnerId is the third input
      if (runnerIdInput && idIndex < runnerIds.length) {
        runnerIdInput.value = runnerIds[idIndex];
        idIndex++;
      }
    }
  }
}
function generateRaceListHTML() {
  const races = getStoredRaces();
  const raceListContainer = document.getElementById("raceList");

  // Clear existing content
  raceListContainer.innerHTML = "";

  if (races.length === 0) {
    raceListContainer.innerHTML = "<p>No offline races found.</p>";
    return;
  }

  // Create a scrollable container
  const scrollableDiv = document.createElement("div");
  scrollableDiv.classList.add("scrollable-race-list");

  races.forEach((race) => {
    const raceCard = document.createElement("div");
    raceCard.classList.add("race-card");

    // Use a template for each race with fallback if data is missing
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
  try {
    // Step 1: Get all races and find the raceId for the given raceCode
    const raceResponse = await fetch("/api/races");
    const allRaces = await raceResponse.json();
    const race = allRaces.find((r) => r.raceCode === raceCode);

    if (!race) {
      const tableBody = document.querySelector("#race-results tbody");
      tableBody.innerHTML = "";
      return;
    }
    const raceId = race.raceId;

    // Step 2: Get race positions using the raceId
    const resultsResponse = await fetch(`/api/races/positions`);
    const allResults = await resultsResponse.json();
    currentStartTime = race.startTimeDate;
    // Step 3: Filter only runners from this race
    const raceResults = allResults.filter((result) => result.raceId === raceId);
    // Get the table body and clear existing content
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = "";

    // Loop through filtered race results and add them to the table
    raceResults.forEach((runner, index) => {
      let row = document.createElement("tr");
      let position = index + 1; // Position starts from 1
      let positionClass = "";

      // Assign medal colors for top 3 positions
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

      // Hidden row for editable details
      const hiddenRow = document.createElement("tr");
      hiddenRow.innerHTML = `
                <td colspan="3">
                    <p><strong>Runner ID:</strong> <span>${
                      runner.runnerId
                    }</span></p>
                    <p><strong>First Name:</strong> <input type="text" id="fname-${
                      runner.runnerId
                    }" value="${
        runner.fName || ""
      }" onInput=detectChanges(this)></p>
                    <p><strong>Last Name:</strong> <input type="text" id="lname-${
                      runner.runnerId
                    }" value="${
        runner.lName || ""
      }" onInput=detectChanges(this)></p>
                    <button class="pill-button" data-position="${position}">Remove</button>
                </td>
            `;
      hiddenRow.classList.add("hidden-row");
      const removeButton = hiddenRow.querySelector(".pill-button");
      removeButton.addEventListener("click", function () {
        removePosition(this.dataset.position);
      });
      tableBody.appendChild(hiddenRow);

      // Toggle visibility on row click
      row.addEventListener("click", () => {
        hiddenRow.classList.toggle("visible-row");
      });
    });
    currentRace = race;
  } catch (error) {
    console.error("Error fetching race data:", error);
    alert("Error loading race results");
  }
}

function removePosition(position) {
  detectChanges();
  const tableBody = document.querySelector("#race-results tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  let found = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const positionCell = row.querySelector("td:first-child");

    if (positionCell && positionCell.textContent.trim() === position) {
      tableBody.removeChild(row); // Remove position row
      if (rows[i + 1] && rows[i + 1].classList.contains("hidden-row")) {
        tableBody.removeChild(rows[i + 1]); // Remove associated details row
      }
      found = true;
      break;
    }
  }

  // If a row was removed, reupdate position numbers
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
      positionCell.textContent = position; // Update position number

      // Reset classes
      row.classList.remove("gold", "silver", "bronze", "standard");

      // Assign medal colors for top 3 positions
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
function createRace(event) {
  window.location.href = "newCreateRace.html";
}

function attachEventHandles(event) {
  generateRaceListHTML();

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
  document.getElementById("saveRaceButt").style.display = "none";
  document.getElementById("revertChangesButt").style.display = "none";
}
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);
