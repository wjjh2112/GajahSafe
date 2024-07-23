document.addEventListener('DOMContentLoaded', () => {
    // Function to handle edit button click
    function handleEditClick(device) {
        const modal = document.getElementById("editDeviceModal");
        const form = document.getElementById("editDeviceForm");

        // Populate modal with device data
        document.getElementById("device-id").textContent = device.id;
        document.getElementById("device-location").value = device.location;
        document.getElementById("device-latitude").value = device.lat;
        document.getElementById("device-longitude").value = device.long;
        document.querySelector(`input[name="status"][value="${device.status}"]`).checked = true;

        // Show modal
        modal.style.display = "block";

        // Handle form submission
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const updatedDevice = {
                id: document.getElementById("device-id").textContent,
                location: document.getElementById("device-location").value,
                lat: document.getElementById("device-latitude").value,
                long: document.getElementById("device-longitude").value,
                status: form.querySelector('input[name="status"]:checked').value
            };

            // Determine device type from the URL or other context
            const deviceType = window.location.pathname.includes("cameras") ? "camera" : "electricFence";

            fetch(`/updateDevice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...updatedDevice, type: deviceType })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Device updated successfully');
                    location.reload(); // Reload to reflect changes
                } else {
                    alert('Failed to update device');
                }
            })
            .catch(error => {
                console.error('Error updating device:', error);
            });

            // Hide modal
            modal.style.display = "none";
        });
    }

    // Function to attach event listeners to edit buttons
    function attachEventListeners() {
        // Add click event listeners to all edit buttons
        document.querySelectorAll('.editBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const deviceRow = btn.closest('tr');
                const deviceData = {
                    id: deviceRow.querySelector('.device-id').textContent,
                    location: deviceRow.querySelector('.device-location').textContent,
                    lat: deviceRow.querySelector('.device-latitude').textContent,
                    long: deviceRow.querySelector('.device-longitude').textContent,
                    status: deviceRow.querySelector('.device-status').textContent
                };
                handleEditClick(deviceData);
            });
        });

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
    }

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

    // Fetch data and initialize event listeners
    function fetchData() {
        fetch('/electricFences')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('electricFenceTableBody');
                tableBody.innerHTML = ''; // Clear any existing rows
                data.forEach(fence => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-name', fence.efName);
                    row.innerHTML = `
                        <td><div class="table-data__info"><p class="device-id">${fence.ef_id}</p></div></td>
                        <td><div class="table-data__info"><h4>${fence.efName}</h4></div></td>
                        <td><p class="device-location">${fence.efLocation}</p></td>
                        <td><p class="device-latitude">${fence.efLat}</p></td>
                        <td><p class="device-longitude">${fence.efLong}</p></td>
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
                attachEventListeners();
            })
            .catch(error => {
                console.error('Error fetching electric fences:', error);
            });

        fetch('/cameras')
            .then(response => response.json())
            .then(cameras => {
                const cameraTableBody = document.getElementById('cameraTableBody');
                cameraTableBody.innerHTML = ''; // Clear existing rows
                cameras.forEach((camera, index) => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-name', camera.camName);
                    row.innerHTML = `
                        <td><div class="table-data__info"><p class="device-id">${camera.cam_id}</p></div></td>
                        <td><div class="table-data__info"><h4>${camera.camName}</h4></div></td>
                        <td><p class="device-location">${camera.camLocation}</p></td>
                        <td><p class="device-latitude">${camera.camLat}</p></td>
                        <td><p class="device-longitude">${camera.camLong}</p></td>
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
                attachEventListeners();
            })
            .catch(error => {
                console.error('Error fetching cameras:', error);
            });
    }

    fetchData(); // Initial data fetch
});
