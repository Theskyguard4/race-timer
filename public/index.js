function openCreateRace(event){
    window.location.href= "createRace.html"
};
function openLogin(event){
    window.location.href= "/login.html"
};
function openRace(event){
    window.location.href = "raceResults.html"
};
function attachEventHandles(event){
    document.getElementById("newRaceButt").addEventListener("click", openCreateRace);
    document.getElementById("loginButt").addEventListener("click", openLogin);
    document.getElementById("compRaceRetrievalButt").addEventListener("click", openRace);
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);
