let raceStart = "";
function getTimeDifferences(startTimeISO) {
  const now = new Date();
  const startTime = new Date(startTimeISO);

  let diffInMs = now - startTime; // Difference in milliseconds
  let countdown = Math.max(-diffInMs, 0); // Countdown (positive, 0 if race started)
  let timer = Math.max(diffInMs, 0); // Timer (positive, 0 if race hasn't started)

  return { timer, countdown };
}
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10); // Keep only two decimal places for ms

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
    times = getTimeDifferences(matchingRace.startTimeDate);
    console.log(matchingRace.ended);
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
    console.log(raceStart);
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
            times.countdown / 10
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
    console.error("Error fetching start data:", error);
    alert("Error getting starts");
    return []; // Return an empty array in case of error
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
  document.body.classList.add("race-started"); // Change background to green
  const timerElement = document.querySelector(".race-timer");

  timerElement.textContent = "Go! Go! Go!";
}
async function onload(event) {
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
      raceCounter = setInterval(updateTimers, 233);
      console.log("Found race:", matchingRace);
    } else {
      console.log("No race found with that code.");
    }
  } catch (error) {
    console.error("Error fetching start data:", error);
    alert("Error getting starts");
    return []; // Return an empty array in case of error
  }
}

document.addEventListener("DOMContentLoaded", onload);
