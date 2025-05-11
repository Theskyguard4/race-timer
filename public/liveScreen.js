let raceStart = "";
function calculateTimeDiff(startTimeISO) {
  const now = new Date();
  const startTime = new Date(startTimeISO);

  let diffInMs = now - startTime; 
  let countdown = Math.max(-diffInMs, 0); 
  let timer = Math.max(diffInMs, 0); 

  return { timer, countdown };
}
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
async function updateTimers() {
  const raceCode = getQueryParam("raceCode");
  try {
    const response = await fetch("/api/races/start");
    const starts = await response.json();
    const matchingRace = starts.find((race) => race.raceCode === raceCode);
    let times = calculateTimeDiff(matchingRace.startTimeDate);
    if (matchingRace) {
      if (matchingRace.ended === -2) {
        document.getElementById("notificationTitle").textContent =
          "Waiting for Race...";
      } else if (matchingRace.ended === -1) {
        const strlen = matchingRace.startTimeDate.length;
        document.getElementById("notificationTitle").textContent =
          "Race starting at: " +
          matchingRace.startTimeDate.slice(strlen - 5, strlen);
      } else if (matchingRace.ended === 0) {
        document.getElementById("notificationTitle").textContent = "Race Time:";
      } else {
        document.getElementById("notificationTitle").textContent = "Race Ended";
      }
    } else {
      raceStart = "N/A";
    }
    if (raceStart === "N/A") {
      document.getElementById("raceTimer").textContent = "N/A";
    } else {
      if (
        times.countdown === 0 &&
        times.timer < 10000 &&
        matchingRace.ended === -1
      ) {
        startRace();
      } else if (times.countdown !== 0 && matchingRace.ended === -1) {
        if (times.countdown < 5000) {
          document.getElementById("raceTimer").textContent = Math.floor(
            times.countdown / 1000
          );
        } else {
          document.getElementById("raceTimer").textContent =
            "Race in: " + formatTime(times.countdown);
        }
      } else {
        document.body.classList.remove("race-started");
        document.getElementById("raceTimer").textContent = formatTime(
          times.timer
        );
      }
    }
  } catch (error) {
    void error;
  
    return []; 
  }
}
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
function startRace() {
  document.body.classList.add("race-started"); 
  const timerElement = document.querySelector(".race-timer");

  timerElement.textContent = "Go! Go! Go!";
}
function updateCheckName(){
  document.getElementById("checkpointTitle").textContent = document.getElementById("checkpointInput").value;
}
async function onload() {
  document
    .getElementById("fullscreenButt")
    .addEventListener("click", toggleFullScreen);
  const raceCode = getQueryParam("raceCode");
  try {
    const response = await fetch("/api/races/start");
    const starts = await response.json();
    const matchingRace = starts.find((race) => race.raceCode === raceCode);

    if (matchingRace) {
      raceStart = matchingRace.startTimeDate;
      let raceCounter = setInterval(updateTimers, 233);
      console.log("Found race:", matchingRace);
    } else {
      console.log("No race found with that code.");
    }
  } catch (error) {
    void error;
    return []; 
  }
  document.getElementById("updateName").addEventListener("click", updateCheckName);
}

document.addEventListener("DOMContentLoaded", onload);
