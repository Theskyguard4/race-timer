let runnerCount = 0;
let saveRaceInterval;
let StartTime = null;
let isSaved = false;
let started = false;
let ended = -2;
let raceCodes = [];
let created = false;
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
    const runnerId = hiddenRow.getElementsByTagName("input")[2].value;
    const runner = new Runner(fname, lname, position, time, runnerId);
    runnerList.push(runner);
  }

  return runnerList;
}

function goBack() {
  window.location.href = "index.html";
}

function getTime() {
  const currentTime = new Date();
  const startTimeObj = new Date(StartTime);
  const diffInMs = currentTime - startTimeObj;
  return diffInMs;
}

async function saveWholeRace() {
  let raceCode = document.getElementById("raceCode").textContent;
  const startTimeDate = document.getElementById("startTimeInput").value;

  const runners = createRunnerList().map((runner) => runner.toJSON()); // Convert runners to JSON format

  try {
    const response = await fetch("/api/races/saveEntireRace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raceCode, startTimeDate, runners, ended }),
    });

    if (!response.ok) {
      toggleSaveIcon(false);
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save race");
    }
    const data = await response.json();
    toggleSaveIcon(true);
    setRunnerIds(data.runnerIds);
  } catch (error) {
    console.error("Error saving race:", error);

    try {
      const response = await fetch("/api/races/saveEntireRace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raceCode, startTimeDate, runners, ended }),
      });

      if (!response.ok) {
        toggleSaveIcon(false);
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save race");
      }

      const data = await response.json();
      toggleSaveIcon(true);
      // Access the runnerIds returned from the backend
      setRunnerIds(data.runnerIds);
    } catch (error) {
      toggleSaveIcon(false);
      console.error("Error saving race:", error);
    }
  }
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
function setRunnerIds(runnerIds) {
  const tableBody = document.getElementById("race-results");
  const rows = tableBody.getElementsByTagName("tr");
  let idIndex = 0;

  for (let i = 1; i < rows.length; i += 2) {
    const hiddenRow = rows[i].nextElementSibling;
    if (hiddenRow) {
      const runnerIdInput = hiddenRow.getElementsByTagName("input")[2]; // Assuming runnerId is the third input
      if (runnerIdInput && idIndex < runnerIds.length) {
        runnerIdInput.value = runnerIds[idIndex];
        idIndex++;
      }
    }
  }
}
function checkOnlineSave() {
  if (navigator.onLine && !isSaved) {
    if (document.getElementById("autoSave").checked) {
      saveWholeRace();
      if (ended == 1) {
        isSaved = true;
      }
      return true;
    }
    toggleSaveIcon(false);
    return false;
  } else {
    if (isSaved == true) {
      return false;
    }

    toggleSaveIcon(false);
    return false;
  }
}
function getRaceCountdown(startTimeStr) {
  const startTime = new Date(startTimeStr); // Convert ISO string to Date object
  const now = new Date();
  const diffInMs = startTime - now; // Time difference in milliseconds
  if (diffInMs <= 0) {
    return { timeLeft: "00:00:00", message: "Race started!" };
  }

  const minutes = Math.floor(diffInMs / 60000);
  const seconds = Math.floor((diffInMs % 60000) / 1000);
  const milliseconds = Math.floor((diffInMs % 1000) / 10); // Two-digit ms

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  let message = "Waiting for start time...";
  if (minutes < 10) message = "Starting soon!";
  if (minutes < 5) message = "Get ready!";
  if (minutes < 1) message = "About to Start!";
  if (seconds <= 30 && minutes < 1) message = `${seconds} seconds`;

  return {
    seconds: seconds.toString(),
    timeLeft: formattedTime,
    msg: message,
    mins: minutes,
  };
}

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  let amPm = "am";
  if (hours >= 12) {
    amPm = "pm";
  }
  document.getElementById(
    "clock"
  ).textContent = `${hours}:${minutes}:${seconds} ${amPm}`;
}
function showAutoStartPopup(secondsLeft, minsLeft) {
  if (secondsLeft === "5" && minsLeft === 0) {
    document.getElementById("autoStartPopup").classList.remove("hidden");
    let countdown = 5;
    const popupTimer = document.getElementById("popupTimer");
    const countdownInterval = setInterval(() => {
      countdown--;
      popupTimer.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    const autoStartTimeout = setTimeout(hideASPopup, 5000);
  }
}
function hideASPopup(){
    document.getElementById("autoStartPopup").classList.add("hidden"); // Function to start the race
};
function getAllStoredRaces() {
  return JSON.parse(localStorage.getItem("offlineRaces")) || [];
}
function getStoredRaceCodes() {
  const storedRaceCodes = JSON.parse(localStorage.getItem("raceCodes")) || [];
  raceCodes = storedRaceCodes; // Set global variable
}

async function saveRaceLocal() {
  let races = getAllStoredRaces();
  let raceCode = document.getElementById("raceCode").textContent;

  let raceName = document.getElementById("infoRaceName").textContent;
  let startTimeDate = "";
  if (ended >= 0) {
    startTimeDate = document.getElementById("startTimeDisplay").textContent;
  } else {
    startTimeDate = document.getElementById("startTimeInput").value;
  }
  let currentRace = races.find(
    (existingRace) => existingRace.raceCode === raceCode
  );
  const runners = createRunnerList();
  if (currentRace) {
    currentRace.runners = runners;
    currentRace.startTimeDate = startTimeDate;
    currentRace.ended = ended;
  } else {
    currentRace = {
      raceCode: raceCode,
      raceName: raceName,
      startTimeDate: startTimeDate,
      ended: ended,
      runners: runners,
    };
    races.push(currentRace); // Add the new race to the list
  }

  // Save the updated race list back to localStorage
  localStorage.setItem("offlineRaces", JSON.stringify(races));
}
async function updateTimer() {
  if (created === false) {
    updateClock();
    return;
  } else {
    updateClock();
  }
  saveRaceLocal();
  if (ended === 1) {
    return;
  }
  const msg = getRaceCountdown(document.getElementById("startTimeInput").value);
  if (
    document.getElementById("startTimeDisplay").textContent === "N/A" &&
    !started
  ) {
    document.getElementById("startsIn").textContent = "N/A";
    if (document.getElementById("startTimeInput").value !== "") {
      document.getElementById("startTimeDisplay").textContent =
        document.getElementById("startTime").value;
      if (document.getElementById("autoStart").checked === true && !started) {
        ended = -1;
      } else if (!started) {
        ended = -2;
      }
    } else if (!started) {
      ended = -2;
    }
  } else if (!started) {
    if (msg.mins > 60) {
      document.getElementById("startsIn").textContent = "1 hour+";
    } else if (document.getElementById("autoStart").checked === true) {
      showAutoStartPopup(msg.seconds, msg.mins);
      document.getElementById("startsIn").textContent = msg.timeLeft;
      ended = -1;
    } else {
      document.getElementById("startsIn").textContent = "Waiting for Race...";
      ended = -2;
    }
  }

  const ready = document.getElementById("autoStart").checked;

  if (ready && msg.timeLeft === "0:00" && !started) {
    startRace();
  } else if (msg.timeLeft === "0:00" && !started) {
    StartTime = "N/A";
  }
  if (!started) {
    if (msg.seconds <= 5 && ready === true) {
      document.getElementById("notificationText").textContent = "starting...";
    } else if (msg.seconds <= 15) {
      if (ready) {
        document.getElementById("notificationText").textContent = msg.msg;
      }
      //document.getElementById("notificationText").hidden = true;
    } else if (msg.seconds <= 60) {
      if (ready === true) {
        document.getElementById("notificationText").textContent = msg.msg;
      } else {
        document.getElementById("notificationText").textContent =
          "Waiting for race...";
        ended = -2;
      }
    } else {
      document.getElementById("notificationText").textContent =
        "Waiting for race...";
      ended = -2;
    }
    if (await isOnline()) {
      saveWholeRace();
    }

    return;
  }

  const diffInMs = getTime();
  const hours = Math.floor(diffInMs / 3600000);
  const minutes = Math.floor((diffInMs % 3600000) / 60000);
  const seconds = Math.floor((diffInMs % 60000) / 1000);
  const milliseconds = Math.floor((diffInMs % 1000) / 10); // Convert to two-digit format
  if (hours >= 23 && minutes >= 59) {
    //Ends race at a time before 24 Hours
    startRace();
  }
  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds
    .toString()
    .padStart(2, "0")}`;
  document.getElementById("timer").textContent = formattedTime;
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
function generateRaceLink() {
  // Get the value of raceCode from the input field
  const raceCode = document.getElementById("raceCode").textContent;

  // Get the current domain and build the URL with the raceCode query parameter
  const currentDomain = window.location.origin; // Gets the base URL (e.g., http://yourdomain.com)
  const raceLink = `${currentDomain}/raceResults.html?raceCode=${raceCode}`;
  const liveLink = `${currentDomain}/liveScreen.html?raceCode=${raceCode}`;

  // Return the generated link
  return { raceLink, liveLink };
}
async function endRace() {
  const raceCode = document.getElementById("raceCode").textContent;
  try {
    const response = await fetch("/api/races/endRace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raceCode }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to End race");
    }
  } catch (error) {
    console.error("Error Ending race:", error);
  }
  const saveButt = document.getElementById("saveRaceButt");
  const clock = document.getElementById("timer");
  document.getElementById("notificationText").textContent = "Race Over";
  document.getElementById("newRaceButt").classList.toggle("hidden");
  document.getElementById("startStopRaceButt").classList.toggle("hidden");
  document.getElementById("addFinishButt").classList.toggle("hidden");
  saveButt.classList.toggle("hidden");
  saveButt.disabled = true;
  saveButt.textContent = "Saved";
  alert(`Race Ended At ${clock.textContent}`);
}

function raceUpdated() {
  const saveButt = document.getElementById("saveRaceButt");
  saveButt.disabled = false;
  saveButt.textContent = "Save Results";
}
function generateUniqueRaceCode() {
  let raceCode;
  let isUnique = false;

  // Loop until a unique race code is found
  while (!isUnique) {
    // Generate a 10-digit race code
    raceCode = Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, "0");

    // Check if the generated race code already exists in the raceCodes list
    if (!raceCodes.includes(raceCode)) {
      isUnique = true; // Set to true once a unique code is found
    }
  }

  // Add the new race code to the list (optional, if you want to keep track of it)
  raceCodes.push(raceCode);

  return raceCode;
}
function getFutureISO(mins) {
  return new Date(Date.now() + mins * 60000).toISOString().slice(0, 16);
}
async function startRace() {
  if (ended === 0) {
    ended = 1;
    started = false;
    endRace();
    saveWholeRace();
    if (navigator.onLine) {
      isSaved = true;
    }
    return;
  }
  if (
    !document.getElementById("autoStart").checked &&
    document.getElementById("countdownValue").textContent !== "0"
  ) {
    let countdown = document.getElementById("countdownValue").textContent;
    document.getElementById("autoStart").checked = true;
    showCountDownTimer();
    document.getElementById("startTimeInput").value = getFutureISO(countdown);
    return;
  }
  const runners = createRunnerList().map((runner) => runner.toJSON());
  const raceCode = document.getElementById("raceCode").textContent;
  const startTimeDate = new Date().toISOString();
  StartTime = startTimeDate;
  ended = 0;
  try {
    const response = await fetch("/api/races/saveEntireRace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raceCode, startTimeDate, runners, ended }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add race");
    }
  } catch (error) {
    console.error("Error starting race:", error);
  }
  started = true;
  document.getElementById("sliderContainer").style.display = "none";
  saveRaceInterval = setInterval(checkOnlineSave, 1000);
  document.getElementById("autoStartSection").classList.add("hidden");
  document.getElementById("startTimeDisplay").textContent = StartTime;
  document.getElementById("notificationText").textContent = "Race Started!";
  document.getElementById("notificationText").hidden = false;
  document.getElementById("startTimeDisplay").hidden = false;
  document.getElementById("startTimeInput").hidden = true;
  document.getElementById("startsIn").hidden = true;
  document.getElementById("startsInLabel").hidden = true;
  document.getElementById("raceCode").disabled = true;
  document.getElementById("startStopRaceButt").innerHTML = "End Race";
  document.getElementById("addFinishButt").classList.toggle("hidden");
}
function reloadPage() {
  if (checkOnlineSave === false) {
    alert(
      "RACE HAS NOT BEEN SAVED, PLEASE CONNECT TO NETWORK BEFORE LEAVING THIS RACE TO UPLOAD RESULTS"
    );
    return;
  }
  location.reload(true);
}

function addFinisher(event) {
  if (StartTime == null) {
    return;
  }
  isSaved = false;
  runnerCount += 1;
  const diffInMs = getTime();

  const hours = Math.floor(diffInMs / 3600000); // Convert ms to hours
  const minutes = Math.floor((diffInMs % 3600000) / 60000); // Get remaining minutes
  const seconds = Math.floor((diffInMs % 60000) / 1000); // Get remaining seconds

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const tableBody = document.getElementById("race-results");
  let position = runnerCount;

  let row = document.createElement("tr");
  row.id = `${position}-row`; // Assign an ID to the main row
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
  row.innerHTML = `
        <td>${position}</td>
        <td>${formattedTime}</td>
    `;

  row.addEventListener("click", () => {
    // Get the next sibling element (hidden row)
    const hiddenRow = row.nextElementSibling;

    // Check if the next sibling is a hidden row
    if (hiddenRow && hiddenRow.classList.contains("hidden-row")) {
      hiddenRow.classList.toggle("visible-row");
    }
  });
  tableBody.appendChild(row);

  const hiddenRow = document.createElement("tr");
  hiddenRow.id = `${position}-hidden`; // Assign an ID to the hidden row
  hiddenRow.innerHTML = `
        <td colspan="3">
            <p><strong>First Name:</strong> <input type="text" id="${position}-runner-fname" ></p>
            <p><strong>Last Name:</strong> <input type="text" id="${position}-runner-lname" ></p>
            <p><input type="text" id="${position}-runner-Id" style="display: none;"  disabled></p>
            <button id="${position}-remove" class="remove-button">Remove</button>
        </td>
    `;
  hiddenRow.classList.add("hidden-row");

  tableBody.appendChild(hiddenRow);

  document.getElementById(`${position}-remove`).addEventListener(
    "click",
    (function (pos) {
      return function () {
        alert("Runner Removed");
        const row = document.getElementById(`${pos}-row`); // Get the row
        const hiddenRow = document.getElementById(`${pos}-hidden`); // Get the hidden row
        if (row) row.remove();
        if (hiddenRow) hiddenRow.remove();

        updatePositions(); // Renumber positions when displaying them
      };
    })(position)
  );
  document.getElementById(`${position}-runner-fname`).addEventListener(
    "change",
    (function (pos) {
      return function () {
        isSaved = false; // Renumber positions when displaying them
      };
    })(position)
  );
  document.getElementById(`${position}-runner-lname`).addEventListener(
    "change",
    (function (pos) {
      return function () {
        isSaved = false; // Renumber positions when displaying them
      };
    })(position)
  );
  //updatePositions(); // Update positions after adding the new finisher
}

// Function to update the positions of all runners in the list
function updatePositions() {
  const tableBody = document.getElementById("race-results");
  const rows = tableBody.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i += 2) {
    const row = rows[i];
    const positionCell = row.getElementsByTagName("td")[0];
    if (positionCell.id.includes("-row")) {
      positionCell.textContent = i + 1;
    }
  }
  raceUpdated();
}
async function isOnline() {
  try {
    const response = await fetch("/api/races", { method: "HEAD" }); // Use HEAD for a lightweight request
    return response.ok; // Returns true if the server responds
  } catch (error) {
    return false; // If fetch fails, return false
  }
}
async function createRace(event) {
  // Get the selected values from the form
  let raceCode = generateUniqueRaceCode();

  document.getElementById("raceCode").innerHTML = raceCode;
  const raceName = document.getElementById("raceName").value;
  const autoSave = document.getElementById("autoSave").checked ? "✔" : "❌";
  // Hide the create race section and show the race info section
  const hasStartTimeCheckbox = document.getElementById("hasStartTime");
  let startTimeDate = "";
  let start = "";
  try {
    start = new Date(document.getElementById("startTime").value).toISOString();
  } catch {
    start = "";
  }
  let ended = -2;
  document.getElementById("startTimeDisplay").textContent = start;
  const setStart = document.getElementById("startTimeDisplay").textContent;
  let ready = false;

  if (setStart !== "") {
    ready = true;
  }
  if (setStart != "" && ready === true) {
    document.getElementById("startTimeInput").value = start.slice(0, 16);
    startTimeDate = setStart;
    document.getElementById("startTimeDisplay").hidden = true;
    ended = -1;
  } else {
    startTimeDate = "N/A";
    document.getElementById("startTimeDisplay").textContent = "N/A";
    document.getElementById("startTimeDisplay").hidden = true;
    document.getElementById("autoStart").checked = false;
    ended = -2;
  }

  try {
    const response = await fetch("/api/races/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raceCode, startTimeDate, ended }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add race");
    }
    const data = await response.json();
  } catch (error) {
    console.error("Error starting race:", error);
  }
  showCountDownTimer();
  document.getElementById("liveScreenLink").innerHTML =
    generateRaceLink().liveLink;
  document.getElementById("raceShareLink").innerHTML =
    generateRaceLink().raceLink;
  document.getElementById("createRaceSection").style.display = "none";
  document.getElementById("infoSection").style.display = "block";

  document.getElementById("infoRaceName").textContent = raceName;
  document.getElementById("infoAutoSave").textContent = autoSave;
  created = true;
}
function cancelAutoStart(event) {
  document.getElementById("autoStartPopup").classList.add("hidden");
  document.getElementById("autoStart").checked = false;
}
function updateCountDownSlider(event) {
  document.getElementById("countdownValue").textContent =
    document.getElementById("countdownSlider").value;
}
function showCountDownTimer() {
  const sliderContainer = document.getElementById("sliderContainer");
  if (document.getElementById("autoStart").checked) {
    sliderContainer.style.display = "none"; // Hides it
  } else {
    sliderContainer.style.display = "block"; // Shows it
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
async function onload(event) {
  raceCounter = setInterval(updateTimer, 233);
  saveRaceCodesLocal();
  document
    .getElementById("countdownSlider")
    .addEventListener("input", updateCountDownSlider);
  document.getElementById("backButt").addEventListener("click", goBack);
  document
    .getElementById("startStopRaceButt")
    .addEventListener("click", startRace);
  document
    .getElementById("addFinishButt")
    .addEventListener("click", addFinisher);
  document.getElementById("newRaceButt").addEventListener("click", reloadPage);
  document.getElementById("newRaceButt").classList.toggle("hidden");
  document.getElementById("saveRaceButt").classList.toggle("hidden");
  document.getElementById("addFinishButt").classList.toggle("hidden");
  // Function to handle when the "Create My Race" button is clicked
  document
    .getElementById("createRaceButton")
    .addEventListener("click", createRace);
  document
    .getElementById("cancelAutoStart")
    .addEventListener("click", cancelAutoStart);
  document
    .getElementById("autoStart")
    .addEventListener("change", showCountDownTimer);
  window.addEventListener("beforeunload", function (event) {
    if (!navigator.onLine) {
      // Check if the user is offline
      event.preventDefault();
    }
  });
  getStoredRaceCodes();
}
// Use event delegation for remove buttons
document.addEventListener("DOMContentLoaded", onload);
