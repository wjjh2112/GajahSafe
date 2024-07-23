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
                row.setAttribute('data-type', 'Electric Fence');
                row.setAttribute('data-name', fence.efName);
                row.setAttribute('data-location', fence.efLocation);
                row.setAttribute('data-lat', fence.efLat);
                row.setAttribute('data-long', fence.efLong);
                row.setAttribute('data-status', fence.efStat);

                row.innerHTML = `
                    <td><div class="table-data__info"><p>${fence.ef_id}</p></div></td>
                    <td><div class="table-data__info"><h4>${fence.efName}</h4></div></td>
                    <td><p>${fence.efLocation}</p></td>
                    <td><p>${fence.efLat}</p></td>
                    <td><p>${fence.efLong}</p></td>
                    <td><p>${fence.efStat}</p></td>
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
                row.setAttribute('data-type', 'Camera');
                row.setAttribute('data-name', camera.camName);
                row.setAttribute('data-location', camera.camLocation);
                row.setAttribute('data-lat', camera.camLat);
                row.setAttribute('data-long', camera.camLong);
                row.setAttribute('data-status', camera.camStat);

                row.innerHTML = `
                    <td><div class="table-data__info"><p>${camera.cam_id}</p></div></td>
                    <td><div class="table-data__info"><h4>${camera.camName}</h4></div></td>
                    <td><p>${camera.camLocation}</p></td>
                    <td><p>${camera.camLat}</p></td>
                    <td><p>${camera.camLong}</p></td>
                    <td><p>${camera.camStat}</p></td>
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
                const row = btn.closest('tr');
                const deviceType = row.getAttribute('data-type');
                const deviceId = row.getAttribute('data-id');
                const deviceName = row.getAttribute('data-name');
                const deviceLocation = row.getAttribute('data-location');
                const deviceLat = row.getAttribute('data-lat');
                const deviceLong = row.getAttribute('data-long');
                const deviceStatus = row.getAttribute('data-status');

                document.getElementById('edit-device-type').value = deviceType;
                document.getElementById('edit-device-id').value = deviceId;
                document.getElementById('device-name').textContent = deviceName;
                document.getElementById('device-id').textContent = deviceId;
                document.getElementById('device-location').value = deviceLocation;
                document.getElementById('device-latitude').value = deviceLat;
                document.getElementById('device-longitude').value = deviceLong;

                if (deviceStatus === 'active') {
                    document.getElementById('activeStatus').checked = true;
                } else if (deviceStatus === 'inactive') {
                    document.getElementById('inactiveStatus').checked = true;
                }

                const editModal = document.getElementById('editDeviceModal');
                editModal.style.display = 'block';
            });
        });

        // Add click event listeners to all delete buttons
        document.querySelectorAll('.deleteBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const row = btn.closest('tr');
                const deviceId = row.getAttribute('data-id');
                const deviceType = row.getAttribute('data-type');

                if (confirm(`Are you sure you want to delete ${deviceType} with ID ${deviceId}?`)) {
                    fetch(`/deleteDevice/${deviceType}/${deviceId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            alert('Device deleted successfully');
                            row.remove();
                        } else {
                            alert('Failed to delete device');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting device:', error);
                    });
                }
            });
        });

        // Close modal logic
        const closeEditDeviceModal = document.getElementById('closeEditDeviceModal');
        closeEditDeviceModal.addEventListener('click', function() {
            const editModal = document.getElementById('editDeviceModal');
            editModal.style.display = 'none';
        });

        // Close modal when clicking outside the modal content
        window.addEventListener('click', function(event) {
            const editModal = document.getElementById('editDeviceModal');
            if (event.target == editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    // Handle form submission to update device details
    document.getElementById('editDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const deviceType = formData.get('device-type');
        const deviceId = formData.get('device-id');

        fetch(`/updateDevice/${deviceType}/${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Device updated successfully');
                location.reload(); // Reload the page to see the updated data
            } else {
                alert('Failed to update device');
            }
        })
        .catch(error => {
            console.error('Error updating device:', error);
        });
    });
});
