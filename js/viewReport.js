document.addEventListener('DOMContentLoaded', () => {
    // Get the modal
    var modal = document.getElementById("viewReportModal");

    // Get the <span> element that closes the modal
    var closeEditDeviceModal = document.getElementById("closeViewReportModal");

    // Add click event listeners to all edit buttons
    document.querySelectorAll('.view-report-btn').forEach((btn) => {
        btn.addEventListener('click', function() {
            modal.style.display = "block";
        });
    });

    // When the user clicks on <span> (x), close the modal
    closeEditDeviceModal.onclick = function() {
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

});