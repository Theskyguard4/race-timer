function openCreateRace(event) {
  window.location.href = "newCreateRace.html";
}
function openLogin(event) {
  window.location.href = "/login.html";
}
function openRace(event) {
  window.location.href = "raceResults.html";
}
function openHelp(event) {
  window.location.href = "help.html";
}

async function getRaceCodes() {
  try {
    const response = await fetch("/api/races");
    const allRaces = await response.json();

    const newRaceCodes = [];

    // Loop through allRaces and push the raceCode into newRaceCodes
    for (let i = 0; i < allRaces.length; i++) {
      newRaceCodes.push(allRaces[i].raceCode);
    }
    // Extract all race codes from the response
    return newRaceCodes;
  } catch (error) {
    console.error("Error fetching race data:", error);
    alert("Error getting races");
    return []; // Return an empty array in case of error
  }
}

async function saveRaceCodesLocal() {
  try {
    const raceCodeList = await getRaceCodes(); // Fetch race codes from API
    localStorage.setItem("raceCodes", JSON.stringify(raceCodeList)); // Save to localStorage
  } catch (error) {
    console.error("Error saving race codes:", error);
  }
}

function attachEventHandles(event) {
  saveRaceCodesLocal();
  document
    .getElementById("newRaceButt")
    .addEventListener("click", openCreateRace);
  document.getElementById("loginButt").addEventListener("click", openLogin);
  document
    .getElementById("compRaceRetrievalButt")
    .addEventListener("click", openRace);
  document.getElementById("helpButt").addEventListener("click", openHelp);
}
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);
