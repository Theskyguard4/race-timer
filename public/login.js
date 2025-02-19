function goBack(event) {
    window.location.href = "index.html";
}

function submitLogin(event) {
    event.preventDefault();
    
    let raceCode = document.getElementById("raceCode").value;
    let racePassword = document.getElementById("racePassword").value;
    
    authenticateRace(raceCode, racePassword);
}

async function authenticateRace(raceCode, racePassword) {
    try {
        const response = await fetch(`/api/races/${raceCode}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ racePassword })
        });

        if (response.ok) {
            const raceData = await response.json();
            displayRaceEditor(raceData);
            await loadLeaderboard(raceData.raceId);
        } else {
            alert("Invalid Race Code or Password");
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

async function loadLeaderboard(raceId) {
    try {
        const raceResultList = await searchRaceResults(raceId);
        const list = document.getElementById("race-results");
        list.innerHTML = ""; // Clear previous results

        raceResultList.forEach(result => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${result.position}</span>
                <span>${result.fName}</span>
                <span>${result.runnerId}</span>
            `;
            list.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

async function searchRaceResults(raceId) {
    try {
        const response = await fetch(`/api/races/${raceId}/positions`);
        const racePositions = await response.json();
        return racePositions;
    } catch (error) {
        console.error("Error fetching race data:", error);
        return [];
    }
}

function displayRaceEditor(raceData) {
    document.getElementById("raceName").value = raceData.name;
    document.getElementById("raceDate").value = raceData.date;

    const raceEditor = document.getElementById("raceEditor");
    raceEditor.classList.remove("hidden"); // Show race settings
}

function attachEventHandles(event) {
    document.getElementById("backButt").addEventListener("click", goBack);
    document.getElementById("submitLoginButt").addEventListener("click", submitLogin);
}

// Run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);
