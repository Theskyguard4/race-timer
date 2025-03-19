
let runnerCount = 0;
let StartTime = null;
let raceCounter = null;
let isSaved = false;
let ended = 0;
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
            runnerId: this.runnerId
        };
    }
}
function createRunnerList() {
    const tableBody = document.getElementById("race-results")
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
        const runnerId = hiddenRow.getElementsByTagName("input")[2].value;;
        const runner = new Runner(fname, lname, position, time, runnerId);
        runnerList.push(runner);
    }
    return runnerList;
};

function goBack(event) {
    window.location.href = "index.html";
};

function getTime() {
    const currentTime = new Date();
    const startTimeObj = new Date(StartTime);
    const diffInMs = currentTime - startTimeObj;
    return diffInMs;
}


async function saveWholeRace() {
    raceCode = document.getElementById("raceCode").value;
    racePassword = document.getElementById("racePassword").value;
    distance = document.getElementById("distance").value;
    participants = document.getElementById("participants").value;
    startTime = StartTime;
    
    
    const runners = createRunnerList().map(runner => runner.toJSON()); // Convert runners to JSON format

    try {
        const response = await fetch('/api/races/saveEntireRace', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ raceCode, racePassword, distance, participants, startTime, runners, ended })
        });

        if (!response.ok) {
            toggleSaveIcon(false)
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save race");
        }

        const data = await response.json();
        console.log("Race Saved successfully:", data);
        
        // Access the runnerIds returned from the backend
        console.log("Runner IDs:", data.runnerIds);
        toggleSaveIcon(true)
        setRunnerIds(data.runnerIds);
        
    } catch (error) {
        console.error("Error saving race:", error);
       
        try {
            const response = await fetch('/api/races/saveEntireRace', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ raceCode, racePassword, distance, participants, startTime, runners, ended })
            });
    
            if (!response.ok) {
                toggleSaveIcon(false)
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save race");
            }
    
            const data = await response.json();
            console.log("Race Saved successfully:", data);
            toggleSaveIcon(true)
            
            // Access the runnerIds returned from the backend
            console.log("Runner IDs:", data.runnerIds);
            setRunnerIds(data.runnerIds);
            
        } catch (error) {
            toggleSaveIcon(false)
            console.error("Error saving race:", error);
            alert("Error saving race: " + error.message);
        }
    }
    
}
function toggleSaveIcon(onOff){
    if (onOff){
        document.getElementById('save-status').classList.remove('not-saved');
        document.getElementById('save-status').classList.add('saved');
        document.getElementById('status-icon').innerHTML = '✔';
        document.getElementById('status-text').innerText = 'Race Online';
    } else {
        document.getElementById('save-status').classList.remove('saved');
        document.getElementById('save-status').classList.add('not-saved');
        document.getElementById('status-icon').innerHTML = '❌';
        document.getElementById('status-text').innerText = 'Race Offline';
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
        console.log("Device is online. Sending data to server...");
        saveWholeRace();
        if (ended == 1) {
            isSaved = true;
        }
        return true;
      
    } else {
        if (isSaved == true) {
            console.log("Data has already been saved.");
            return false
        }
        toggleSaveIcon(false)
        console.log("Device is offline. Storing data locally...");
        return false;
    }
}

function updateTimer(event) {
    const diffInMs = getTime();
    const minutes = Math.floor(diffInMs / 60000);
    const seconds = Math.floor((diffInMs % 60000) / 1000);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const clock = document.getElementById("timer");
    clock.textContent = formattedTime;
}

async function checkRaceCode(raceCode) {
    try {
        const response = await fetch('/api/races');
        const allRaces = await response.json();
        const raceExists = allRaces.find(race => race.raceCode === raceCode);
        return !!raceExists;
    } catch (error) {
        console.error("Error fetching race data:", error);
        return false;
    }
}

async function endRace() {
    clearInterval(raceCounter);
   
    const raceCode = document.getElementById("raceCode").value
    try {
        const response = await fetch('/api/races/endRace', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ raceCode })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to End race");
        }
        const data = await response.json();
        console.log("Race Ended successfully:");
    } catch (error) {
        console.error("Error Ending race:", error);
    }
    const saveButt = document.getElementById("saveRaceButt")
    const clock = document.getElementById("timer");
    document.getElementById("newRaceButt").classList.toggle('hidden');
    document.getElementById("startStopRaceButt").classList.toggle("hidden");
    document.getElementById("addFinishButt").classList.toggle("hidden");
    saveButt.classList.toggle('hidden');
    saveButt.disabled = true;
    saveButt.textContent = "Saved"
    const tableBody = document.getElementById("race-results");
    const runnerCount = tableBody ? tableBody.getElementsByTagName("tr").length : 0;
    document.getElementById("participants").value = (runnerCount - 1) / 2;
    alert(`Race Ended At ${clock.textContent}`);
}


function raceUpdated(){
    saveButt = document.getElementById("saveRaceButt")
    saveButt.disabled = false;
    saveButt.textContent = "Save Results"
}


async function startRace(event) {
    if (StartTime != null) {
        ended = 1;
        endRace();
        saveWholeRace();
        if (navigator.onLine) {
            isSaved = true;
        }
        return;
    }
    const raceCode = document.getElementById("raceCode").value;
    const racePassword = document.getElementById("racePassword").value;
    const distance = document.getElementById("distance").value;
    const participants = document.getElementById("participants").value;
    if (raceCode.length != 10 || racePassword == "") {
        alert("Please fill in Required fields: Race Code (10 characters), Race Password");
        console.log("Please fill in all fields");
        return;
    } else {
        if (await checkRaceCode(raceCode)) {
            alert("Race Code Already Used");
            return;
        }
    }
    const startTime = new Date();
    StartTime = startTime;
    
    try {
        const response = await fetch('/api/races/add', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ raceCode, racePassword, distance, participants, startTime })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add race");
        }
        const data = await response.json();
        console.log("Race added successfully:");
        
    } catch (error) {
        console.error("Error starting race:", error);
    }
    raceCounter = setInterval(updateTimer, 1000);
    saveRaceInterval = setInterval(checkOnlineSave, 2000);
    document.getElementById("distance").disabled = true;
    document.getElementById("raceCode").disabled = true;
    document.getElementById("racePassword").disabled = true;
    document.getElementById("startStopRaceButt").innerHTML = "End Race";
    document.getElementById("addFinishButt").classList.toggle('hidden')
}


async function saveRunner(hours, minutes, seconds, position, runnerId){
    const raceCode = parseInt(document.getElementById("raceCode").value)
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    try {
        const response = await fetch('/api/races/addSingleRaceResult', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({runnerId, raceCode, position, time })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add position");
        }
        const data = await response.json();
        console.log("Position added successfully:", data);
        
    } catch (error) {
        console.error("Error adding position:", error);
        alert("Error adding position: " + error.message);
    }
}

   
function reloadPage(event) {
    if (checkOnlineSave === false) {
        alert("RACE HAS NOT BEEN SAVED, PLEASE CONNECT TO NETWORK BEFORE LEAVING THIS RACE TO UPLOAD RESULTS");
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
    
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;


    const tableBody = document.getElementById("race-results");
    
    runnerId = ""
    position = runnerCount
    //saveRunner(hours, minutes, seconds, position, runnerId)
    

    let row = document.createElement("tr");
    row.id = `${position}-row`;  // Assign an ID to the main row
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
    
    row.addEventListener('click', () => {
         // Get the next sibling element (hidden row)
        const hiddenRow = row.nextElementSibling;
        
        // Check if the next sibling is a hidden row
        if (hiddenRow && hiddenRow.classList.contains('hidden-row')) {
            hiddenRow.classList.toggle('visible-row');
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
    
    document.getElementById(`${position}-remove`).addEventListener('click', (function(pos) {
        return function() {
            alert("Runner Removed");
            const row = document.getElementById(`${pos}-row`);         // Get the row
            const hiddenRow = document.getElementById(`${pos}-hidden`); // Get the hidden row
            if (row) row.remove(); 
            if (hiddenRow) hiddenRow.remove(); 
    
            updatePositions();  // Renumber positions when displaying them
        };
    })(position));
    document.getElementById(`${position}-runner-fname`).addEventListener('change', (function(pos) {
        return function() {
            isSaved = false// Renumber positions when displaying them
        };
    })(position));
    document.getElementById(`${position}-runner-lname`).addEventListener('change', (function(pos) {
        return function() {
            isSaved = false// Renumber positions when displaying them
        };
    })(position));
    //updatePositions(); // Update positions after adding the new finisher
}


async function saveRunnerData( fname, lname, position, raceCode) {
    try {
        const response = await fetch('/api/races/editRunner', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({fname, lname, position, raceCode})
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to edit runner");
        }
        const data = await response.json();
        console.log("runner edited successfully:", data);
        
    } catch (error) {
        console.error("Error editing runner:", error);
        alert("Error editing runner: " + error.message);
        return;
    }
}


// Function to update the positions of all runners in the list
function updatePositions() {
    const tableBody = document.getElementById("race-results");
    const rows = tableBody.getElementsByTagName("tr");
    console.log(rows)
    for (let i = 0; i < rows.length; i += 2){
        const row = rows[i];
        const positionCell = row.getElementsByTagName("td")[0];
        if (positionCell.id.includes("-row")) {
            positionCell.textContent = i + 1;
        }
    }
    raceUpdated()
}

// Use event delegation for remove buttons
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("backButt").addEventListener("click",goBack)
    document.getElementById("startStopRaceButt").addEventListener("click", startRace);
    document.getElementById("addFinishButt").addEventListener("click", addFinisher);
    document.getElementById("newRaceButt").addEventListener("click", reloadPage);
    document.getElementById("newRaceButt").classList.toggle('hidden');
    document.getElementById("saveRaceButt").classList.toggle('hidden');
    document.getElementById("addFinishButt").classList.toggle('hidden');
    window.addEventListener("beforeunload", function (event) {
        if (!navigator.onLine) { // Check if the user is offline
            event.preventDefault();
            
        }
    });
});
