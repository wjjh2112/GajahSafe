document.addEventListener('DOMContentLoaded', () => {
    // Fetch electric fences data from the backend
    fetch('/electricFences')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('electricFenceTableBody');
            tableBody.innerHTML = ''; // Clear any existing rows

            data.forEach(fence => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', fence.ef_id);

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
            attachEventListeners();
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
            cameras.forEach(camera => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', camera.cam_id);

                row.innerHTML = `
                    <td><div class="table-data__info"><p>${camera.cam_id}</p></div></td>
                    <td><div class="table-data__info"><h4>${camera.camName}</h4></div></td>
                    <td><p>${camera.camLocation}</p></td>
                    <td><p>${camera.camLat}</p></td>
                    <td><p>${camera.camLong}</p></td>
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
            attachEventListeners();
        })
        .catch(error => {
            console.error('Error fetching cameras:', error);
        });

    // Attach event listeners for modal and delete logic
    function attachEventListeners() {
        // Add click event listeners to all edit buttons
        document.querySelectorAll('.editBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const deviceRow = btn.closest('tr');
                const deviceId = deviceRow.getAttribute('data-id');
                const deviceName = deviceRow.querySelector('h4').textContent;

                fetchDeviceDetails(deviceId, deviceName);
            });
        });

        // Add click event listeners to all delete buttons
        document.querySelectorAll('.deleteBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                var deviceRow = btn.closest('tr');
                var deviceId = deviceRow.getAttribute('data-id');
                var deviceName = deviceRow.querySelector('h4').textContent;
                if (confirm("Confirm to delete " + deviceName)) {
                    fetch(`/deleteDevice/${deviceId}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                deviceRow.remove();
                            } else {
                                alert("Failed to delete device");
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting device:', error);
                        });
                }
            });
        });
    }

    // Fetch device details and populate the modal
    function fetchDeviceDetails(deviceId, deviceName) {
        const modal = document.getElementById("editDeviceModal");
        const closeEditDeviceModal = document.getElementById("closeEditDeviceModal");
        const deviceIdField = document.getElementById("deviceId");
        const deviceNameField = document.getElementById("deviceName");
        const locationField = document.getElementById("device-location");
        const latitudeField = document.getElementById("device-latitude");
        const longitudeField = document.getElementById("device-longitude");
        const statusActive = document.getElementById("activeStatus");
        const statusInactive = document.getElementById("inactiveStatus");

        // Fetch the details of the device from the backend
        fetch(`/deviceDetails/${deviceId}`)
            .then(response => response.json())
            .then(device => {
                deviceIdField.textContent = device._id;
                deviceNameField.textContent = device[`${device.type}Name`];
                locationField.value = device[`${device.type}Location`];
                latitudeField.value = device[`${device.type}Lat`];
                longitudeField.value = device[`${device.type}Long`];
                if (device[`${device.type}Stat`] === "active") {
                    statusActive.checked = true;
                } else {
                    statusInactive.checked = true;
                }
                modal.style.display = "block";
            })
            .catch(error => {
                console.error('Error fetching device details:', error);
            });

        closeEditDeviceModal.onclick = function() {
            modal.style.display = "none";
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };

        // Handle form submission
        document.getElementById("editDeviceForm").onsubmit = function(e) {
            e.preventDefault();
            const location = locationField.value;
            const latitude = latitudeField.value;
            const longitude = longitudeField.value;
            const status = document.querySelector('input[name="status"]:checked').value;

            fetch(`/updateDevice/${deviceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: location,
                    latitude: latitude,
                    longitude: longitude,
                    status: status
                })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        location.reload(); // Reload to reflect changes
                    } else {
                        alert("Failed to update device");
                    }
                })
                .catch(error => {
                    console.error('Error updating device:', error);
                });
        };
    }
});
