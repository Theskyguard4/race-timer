// JavaScript to handle the accordion (toggle question/answer)
function goBack(event) {
    window.location.href = "index.html";
};
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("backButt").addEventListener("click",goBack)
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', function () {
            // Toggle the 'active' class to open/close the FAQ item
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            const arrow = this.querySelector('.arrow'); // Get the arrow inside the question

            // Toggle the max-height of the answer section
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null; // Collapse the answer
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px"; // Expand the answer
            }

            // Toggle rotation of the arrow
            if (arrow) {
                arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    });
});
