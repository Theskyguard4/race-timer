let updateInterval = null;
let autoUpdate = true;
function goBack(event) {
  window.location.href = "index.html";
}
function getTime(startTimeISO) {
  const currentTime = new Date();
  const startTimeObj = new Date(Date.parse(startTimeISO));
  return currentTime - startTimeObj;
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
async function autoUpdateResults() {
  autoUpdate = document.getElementById("toggleSwitch").checked;
}
async function findRace() {
  let code = document.getElementById("raceCode").value;

  if (code.length === 10) {
    const race = await searchRaceCode(code);
    if (race === null) {
      return;
    }
    const raceId = race.raceId;

    const raceResultList = await searchRaceResults(raceId);
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = "";
    raceResultList.forEach((result, index) => {
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
      let fnameLet = "";
      if (result.fName !== null) {
        fnameLet = result.fName.charAt(0).toUpperCase();
      } else {
        fnameLet = "";
      }
      row.innerHTML = `
                <td>${position}</td>
                <td>${fnameLet} ${result.lName || ""}</td>
                <td>${result.time}</td>
            `;

      tableBody.appendChild(row);
      const hiddenRow = document.createElement("tr");
      hiddenRow.innerHTML = `
                <td colspan="3">
                    <p><strong>Runner ID:</strong> ${result.runnerId}</p>
                    <p><strong>Full Name:</strong> ${result.fName} ${result.lName}</p>
                </td>
            `;
      hiddenRow.classList.add("hidden-row");

      tableBody.appendChild(hiddenRow);
    });
  } else {
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = "";
  }
}
async function searchRaceResults(raceId) {
  let race = [];
  try {
    const response = await fetch("/api/races/positions");
    const racePositions = await response.json();

    for (const runner of racePositions) {
      if (runner.raceId === parseInt(raceId)) {
        race.push(runner);
      }
    }
  } catch (error) {
    void error;
    return race;
  }
  return race;
}
async function searchRaceCode(raceCode) {
  try {
    const response = await fetch("/api/races");
    const races = await response.json();
    const race = races.find((race) => race.raceCode === String(raceCode));
    return race || null;
  } catch (error) {
    void error;
    return null;
  }
}

async function update() {
  if (autoUpdate === true) {
    try {
      const response = await fetch("/api/races");
      const races = await response.json();
      let raceCode = document.getElementById("raceCode").value;
      const race = races.find((race) => race.raceCode === String(raceCode));
      if (raceCode.length !== 10) {
        return;
      }
      if (String(race.ended) === "0") {
        const diffInMs = getTime(race.startTimeDate);
        const hours = Math.floor(diffInMs / 3600000);
        const minutes = Math.floor((diffInMs % 3600000) / 60000);
        const seconds = Math.floor((diffInMs % 60000) / 1000);
        console.log(diffInMs);
        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        document.getElementById("timer").innerHTML = formattedTime;
      } else if (String(race.ended) < 0) {
        document.getElementById("timer").innerHTML = "Waiting for Race";
      } else {
        const tableBody = document.querySelector("#race-results tbody");
        const rows = tableBody.children;
        if (rows.length > 1) {
          const secondLastRow = rows[rows.length - 2];
          const lastTime = secondLastRow.children[2].innerHTML;
          document.getElementById("timer").innerHTML =
            "Finish time: " + lastTime;
        } else {
          document.getElementById("timer").innerHTML = "";
        }
      }
      findRace();
    } catch (error) {
      void error;
    }
  } else {
    document.getElementById("timer").innerHTML = "";
  }
}
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function attachEventHandles() {
  document.getElementById("backButt").addEventListener("click", goBack);
  document.getElementById("raceCode").addEventListener("input", findRace);
  document
    .getElementById("toggleSwitch")
    .addEventListener("change", autoUpdateResults);
  updateInterval = setInterval(update, 500);
  const raceCode = getQueryParam("raceCode");
  if (raceCode) {
    document.getElementById("raceCode").value = raceCode;
  }
}

document.addEventListener("DOMContentLoaded", attachEventHandles);
