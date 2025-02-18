function goBack(event){
    window.location.href= "index.html"
};
function attachEventHandles(event){
    document.getElementById("backButt").addEventListener("click", goBack);
    
};
// Function to run when the DOM is loaded
document.addEventListener("DOMContentLoaded", attachEventHandles);