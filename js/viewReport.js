document.addEventListener('DOMContentLoaded', function() { 
    // Get the modal
    var modal = document.getElementById("viewReportModal");

    // Get the buttons that open the modal
    var viewButtons = document.querySelectorAll(".view-report-btn");

    // Get the <span> element that closes the modal
    var closeModal = document.getElementById("closeViewReportModal");

    // When the user clicks the button, open the modal 
    viewButtons.forEach(button => {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            modal.style.display = "block";
        });
    });

    // When the user clicks on <span> (x), close the modal
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});
