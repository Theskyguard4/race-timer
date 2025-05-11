function openCreateRace() {
  window.location.href = "createRace.html";
}
function openLogin() {
  window.location.href = "login.html";
}
function openRace() {
  window.location.href = "raceResults.html";
}
function openMarshall() {
  window.location.href = "marshall.html";
}

async function getRaceCodes() {
  try {
    const response = await fetch("/api/races");
    const allRaces = await response.json();

    const newRaceCodes = [];

    for (let i = 0; i < allRaces.length; i++) {
      newRaceCodes.push(allRaces[i].raceCode);
    }

    return newRaceCodes;
  } catch (error) {
    console.error("Error fetching race data:", error);
    alert("Error getting races");
    return [];
  }
}

async function saveRaceCodesLocal() {
  try {
    const raceCodeList = await getRaceCodes();
    localStorage.setItem("raceCodes", JSON.stringify(raceCodeList));
  } catch (error) {
    console.error("Error saving race codes:", error);
  }
}

function attachEventHandles() {
  saveRaceCodesLocal();
  document
    .getElementById("newRaceButt")
    .addEventListener("click", openCreateRace);
  document.getElementById("loginButt").addEventListener("click", openLogin);
  document
    .getElementById("compRaceRetrievalButt")
    .addEventListener("click", openRace);
  document
    .getElementById("marshallButt")
    .addEventListener("click", openMarshall);
}

document.addEventListener("DOMContentLoaded", attachEventHandles);
