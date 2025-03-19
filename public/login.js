function goBack(event){
    window.location.href= "index.html"
};
function submitLogin(event){
    let raceCode = document.getElementById("raceCode").value;
    let racePassword = document.getElementById("racePassword").value;
    
};
async function get_race(event, raceCode) {
    try {
        const response = await fetch('/api/races');
        const races = await response.json();
        raceList = [];
        races.forEach(race => {
           if (race.raceCode == raceCode) {
            return race
           }
        });
    } catch (error) {
        console.error("Error fetching race data:", error);
    }
};

function attachEventHandles(event){
    document.getElementById("backButt").addEventListener("click", goBack);
    document.getElementById("submitLoginButt").addEventListener("click", submitLogin);
    document.getElementById
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);