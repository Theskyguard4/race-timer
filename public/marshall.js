let runnerList = [];
let runnerCount = 0;
class Runner {
  constructor(position, time) {
    this.position = position;
    this.time = time;
  }

  toJSON() {
    return {
      position: this.position,
      time: this.time,
    };
  }
}
function goBack() {
  window.location.href = "index.html";
}
async function uploadResults() {
  const raceCode = document.getElementById("raceCode").value.trim();
  const checkpointName = document.getElementById("checkpointName").value.trim();
  const marshallName = document.getElementById("marshallName").value.trim();
  let checkpointDistance = document
    .getElementById("checkpointDistance")
    .value.trim();
  if (!raceCode) {
    alert("Race code is missing!");
    return;
  }
  if (runnerList.length === 0) {
    alert("No times entered!");
    return;
  }
  if (!checkpointName) {
    alert("Checkpoint name is missing!");
    return;
  }
  if (!marshallName) {
    alert("Marshall name is missing!");
    return;
  }
  if (!checkpointDistance) {
    checkpointDistance = 0;
  }

  const times = runnerList.map((runner) => runner.time);

  console.log(runnerList);

  if (times.length === 0) {
    alert("No times entered!");
    return;
  }

  try {
    console.log("Checkpoint Name: ", checkpointName);
    console.log("Marshall Name: ", marshallName);
    const marshallRes = await fetch(`/api/races/${raceCode}/addMarshall`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marshallName: marshallName,
        checkpointName: checkpointName,
        checkpointDistance: checkpointDistance,
      }),
    });

    if (!marshallRes.ok) throw new Error("Failed to add Marshall");

    const marshallData = await marshallRes.json();
    const marshalId = marshallData.marshalId;
    console.log("Marshall ID: ", marshalId);

    for (const time of times) {
      await fetch("/api/marshall-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: time,
          marshallId: marshalId,
        }),
      });
    }

    alert("Upload complete!");
  } catch (error) {
    console.error(error);
    alert("Failed to upload results.");
  }
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
function formatDateTime(isoString) {
  if (!isoString) return "-";

  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  let seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function siteLoaded() {
  const raceListContainer = document.getElementById("runnerList");
  const clockTimer = setInterval(updateClock, 333);
  document.getElementById("backButt").addEventListener("click", goBack);
  raceListContainer.innerHTML = "";

  if (runnerList.length === 0) {
    const scrollableDiv = document.createElement("div");
    scrollableDiv.classList.add("scrollable-race-list");

    const raceCard = document.createElement("div");
    raceCard.classList.add("runner-card");

    raceCard.innerHTML = `
                 <p class="race-code"><strong>No Runners</strong></p>
            `;

    scrollableDiv.appendChild(raceCard);

    raceListContainer.appendChild(scrollableDiv);
  }
  document.getElementById("uploadBtn").addEventListener("click", uploadResults);
  document
    .getElementById("incrementCounter")
    .addEventListener("click", addRunner);
}
function addRunner() {
  const timeRecorded = new Date().toISOString();
  if (timeRecorded) {
    runnerCount += 1;
    const newRunner = new Runner(runnerCount, timeRecorded);
    runnerList.push(newRunner);
    const raceListContainer = document.getElementById("runnerList");

    raceListContainer.innerHTML = "";

    if (runnerList.length === 0) {
      const scrollableDiv = document.createElement("div");
      scrollableDiv.classList.add("scrollable-race-list");

      const raceCard = document.createElement("div");
      raceCard.classList.add("runner-card");

      raceCard.innerHTML = `
                     <p class="race-code"><strong>No Runners</strong></p>
                `;

      scrollableDiv.appendChild(raceCard);

      raceListContainer.appendChild(scrollableDiv);
      return;
    }

    const scrollableDiv = document.createElement("div");
    scrollableDiv.classList.add("scrollable-race-list");

    runnerList.forEach((runner) => {
      const raceCard = document.createElement("div");
      raceCard.classList.add("runner-card");

      raceCard.innerHTML = `
                  <p class="race-code"><strong>Runner:</strong> ${
                    runner.position || "no"
                  } | ${formatDateTime(runner.time) || "N/A"}</p>
              `;

      scrollableDiv.appendChild(raceCard);
    });

    raceListContainer.appendChild(scrollableDiv);
  }
}
document.addEventListener("DOMContentLoaded", siteLoaded);
