document.addEventListener('DOMContentLoaded', () => {
    // Fetch electric fences data from the backend
    fetch('/electricFences')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('electricFenceTableBody');
            tableBody.innerHTML = ''; // Clear any existing rows

            data.forEach(fence => {
                const row = document.createElement('tr');
                row.setAttribute('data-name', fence.efName);

                row.innerHTML = `
                    <td><div class="table-data__info"><p>${fence.ef_id}</p></div></td>
                    <td><div class="table-data__info"><h4>${fence.efName}</h4></div></td>
                    <td><p>${fence.efLocation}</p></td>
                    <td><p>${fence.efLong}</p></td>
                    <td><p>${fence.efLat}</p></td>
                    <td class="text-center">
                        <span class="more">
                            <i class="zmdi zmdi-edit editBtn"></i>
                        </span>
                        <span class="more">
                            <i class="zmdi zmdi-delete deleteBtn"></i>
                        </span>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Add event listeners to the newly added edit and delete buttons
            document.querySelectorAll('.editBtn').forEach((btn) => {
                btn.addEventListener('click', function() {
                    modal.style.display = "block";
                });
            });

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
        })
        .catch(error => {
            console.error('Error fetching electric fences:', error);
        });

    // Modal and delete logic remains the same
    var modal = document.getElementById("editDeviceModal");
    var closeEditDeviceModal = document.getElementById("closeEditDeviceModal");

    closeEditDeviceModal.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById('addDeviceBtn').addEventListener('click', function() {
        window.location.href = 'addDevice.html';
    });
});
