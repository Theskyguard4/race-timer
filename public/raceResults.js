function goBack(event){
    window.location.href= "index.html"
};
function findRace(){
    if (length(document.getElementById("raceCode").value) == 10){
        searchRaceCode(document.getElementById("raceCode").value);
    }
}
function searchRaceCode(code){

}
function attachEventHandles(event){
    document.getElementById("backButt").addEventListener("click", goBack);
    document.getElementById("raceCode").addEventListener("input", goBack);
    
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);