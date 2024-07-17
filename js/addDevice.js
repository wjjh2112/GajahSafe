document.addEventListener('DOMContentLoaded', () => {
    // Function to format date to dd/mm/yyyy
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

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
                    <td><p>${fence.efLat}</p></td>
                    <td><p>${fence.efLong}</p></td>
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
    
    // Fetch camera data and populate the table
    fetch('/cameras')
    .then(response => response.json())
    .then(cameras => {
        const cameraTableBody = document.getElementById('cameraTableBody');
        cameraTableBody.innerHTML = ''; // Clear existing rows
        cameras.forEach((camera, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-name', camera.camName);
        row.innerHTML = `
            <td><div class="table-data__info"><p>${index + 1}</p></div></td>
            <td><div class="table-data__info"><h4>${camera.camName}</h4></div></td>
            <td><p>${camera.camLocation}</p></td>
            <td><p>${camera.camLong}</p></td>
            <td><p>${camera.camLat}</p></td>
            <td><p>${formatDate(camera.camInstallDate)}</p></td> <!-- Format installation date -->
            <td class="text-center">
            <span class="more">
                <i class="zmdi zmdi-edit editBtn"></i>
            </span>
            <span class="more">
                <i class="zmdi zmdi-delete deleteBtn"></i>
            </span>
            </td>
        `;
        cameraTableBody.appendChild(row);
        });

        // Re-attach event listeners for dynamically added edit and delete buttons
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
        console.error('Error fetching cameras:', error);
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
