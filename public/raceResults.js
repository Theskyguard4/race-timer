function goBack(event){
    window.location.href= "index.html"
};
async function findRace(){
    code = document.getElementById("raceCode").value
    console.log(code);
    const race = await searchRaceCode((code));
    console.log(race);
    const raceId = race.raceId
    
    
    if (code.length == 10){
        const raceResultList = await searchRaceResults(raceId);
        list = document.getElementById("race-results");
        list.innerHTML = ""; // Clear previous results
        raceResultList.forEach(result => {
            let listItem = document.createElement("li");
            listItem.textContent = `${result.position}: Runner ID: ${result.runnerId}, Name: ${result.fName}`;
            list.appendChild(listItem);
        });
    } else {
        list.innerHTML = ""; // Clear previous results
    }
}
async function searchRaceResults(raceId) {
    try {
        const response = await fetch('/api/races/:raceId/positions');
        const racePositions = await response.json();
        race = []
        for (const runner of racePositions) {
            if (runner.raceId == raceId) {
                race.push(runner)
               }
        };
    
    } catch (error) {
        console.error("Error fetching race data:", error);
        return race
    }
    return race
};
async function searchRaceCode(raceCode) {
    try {
        const response = await fetch('/api/races');
        const races = await response.json();
        raceList = [];
        const race = races.find(race => race.raceCode == raceCode);
        return race || null;
    } catch (error) {
        console.error("Error fetching race data:", error);
        return null
    }
    return null
};
function attachEventHandles(event){
    document.getElementById("backButt").addEventListener("click", goBack);
    document.getElementById("raceCode").addEventListener("input", findRace);
    
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);