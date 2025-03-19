let updateInterval = null;
let autoUpdate = true;
function goBack(event) {
  window.location.href = "index.html";
}
function getTime(startTime) {
  const currentTime = new Date();
  const startTimeObj = new Date(startTime);
  const diffInMs = currentTime - startTimeObj;
  return diffInMs;
}
function formatTime(isoDate) {
  const date = new Date(isoDate);
  const hours = String(date.getUTCHours()).padStart(2, "0"); // Get hours and pad with zero if needed
  const minutes = String(date.getUTCMinutes()).padStart(2, "0"); // Get minutes and pad with zero if needed
  const seconds = String(date.getUTCSeconds()).padStart(2, "0"); // Get seconds and pad with zero if needed

  return `${hours}:${minutes}:${seconds}`;
}
async function autoUpdateResults() {
  autoUpdate = document.getElementById("toggleSwitch").checked;
}
async function findRace() {
  code = document.getElementById("raceCode").value;

  if (code.length === 10) {
    const race = await searchRaceCode(code);

    const raceId = race.raceId;

    const raceResultList = await searchRaceResults(raceId);
    const tableBody = document.querySelector("#race-results tbody");
    tableBody.innerHTML = ""; // Clear previous results

    raceResultList.forEach((result, index) => {
      let row = document.createElement("tr");
      let position = index + 1; // Position starts from 1 (not 0)
      let positionClass = "";

      // Set position class based on the position
      if (position === 1) {
        positionClass = "gold"; // First place
      } else if (position === 2) {
        positionClass = "silver"; // Second place
      } else if (position === 3) {
        positionClass = "bronze"; // Third place
      } else {
        positionClass = "standard"; // All other positions
      }

      row.classList.add(positionClass);
      if (result.fName !== null) {
        fnameLet = result.fName.charAt(0).toUpperCase();
      } else {
        fnameLet = "";
      }
      fnameLet = row.innerHTML = `
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
    tableBody.innerHTML = ""; // Clear previous results
  }
}
async function searchRaceResults(raceId) {
  try {
    const response = await fetch("/api/races/:raceId/positions");
    const racePositions = await response.json();
    race = [];
    console.log("racePositions: ", racePositions);
    for (const runner of racePositions) {
      if (runner.raceId === parseInt(raceId)) {
        race.push(runner);
      }
    }
  } catch (error) {
    console.error("Error fetching race data:", error);
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
    console.error("Error fetching race data:", error);
    return null;
  }
  return null;
}

async function update() {
  if (autoUpdate === true) {
    try {
      const response = await fetch("/api/races");
      const races = await response.json();
      raceCode = document.getElementById("raceCode").value;
      const race = races.find((race) => race.raceCode === String(raceCode));
      if (String(race.ended) === "0") {
        const diffInMs = getTime(race.start);
        const hours = Math.floor(diffInMs / 3600000); // Convert ms to hours
        const minutes = Math.floor((diffInMs % 3600000) / 60000); // Get remaining minutes
        const seconds = Math.floor((diffInMs % 60000) / 1000); // Get remaining seconds

        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        console.log("formattedTime: ", formattedTime);
        document.getElementById("timer").innerHTML = formattedTime;
      } else {
        const tableBody = document.querySelector("#race-results tbody");
        const rows = tableBody.children;
        if (rows.length > 1) {
          // Ensure there are at least 2 rows
          const secondLastRow = rows[rows.length - 2]; // Get the second-to-last row
          const lastTime = secondLastRow.children[2].innerHTML;
          document.getElementById("timer").innerHTML =
            "Finish time: " + lastTime;
        } else {
          document.getElementById("timer").innerHTML = "";
        }
      }
      findRace();
    } catch (error) {
      console.error("Error fetching race data:", error);
    }
  } else {
    document.getElementById("timer").innerHTML = "";
  }
}
function attachEventHandles(event) {
  document.getElementById("backButt").addEventListener("click", goBack);
  document.getElementById("raceCode").addEventListener("input", findRace);
  document
    .getElementById("toggleSwitch")
    .addEventListener("change", autoUpdateResults);
  updateInterval = setInterval(update, 500);
}
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);
