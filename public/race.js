function attachEventHandles(event){
    document.getElementById("backButt").addEventListener("click", goBack);
    document.getElementById("raceCode").addEventListener("input", goBack);
    
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);