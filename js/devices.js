document.addEventListener('DOMContentLoaded', () => {
    // Get the modal
    var modal = document.getElementById("editDeviceModal");

    // Get the <span> element that closes the modal
    var closeEditDeviceModal = document.getElementById("closeEditDeviceModal");

    // Add click event listeners to all edit buttons
    document.querySelectorAll('.editBtn').forEach((btn) => {
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

    // Add click event listeners to all delete buttons
    document.querySelectorAll('.deleteBtn').forEach((btn) => {
        btn.addEventListener('click', function() {
            var deviceRow = btn.closest('tr');
            var deviceName = deviceRow.getAttribute('data-name');
            if (confirm("Confirm to delete " + deviceName)) {
                deviceRow.remove();
            } else {
                window.location.href = "devices.html";
            }
        });
    });
});

document.getElementById('addDeviceBtn').addEventListener('click', function() {
    window.location.href = 'addDevice.html';
});