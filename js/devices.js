document.getElementById('addDeviceBtn').addEventListener('click', function() {
    window.location.href = '/Add-New-Device';
});

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
                    <td><p>${fence.efStat}</p></td>
                    <td class="text-center">
                        <span class="more">
                            <i class="zmdi zmdi-edit editDevBtn"></i>
                        </span>
                        <span class="more">
                            <i class="zmdi zmdi-delete deleteDevBtn"></i>
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
                    <td><p>${camera.camStat}</p></td>
                    <td class="text-center">
                        <span class="more">
                            <i class="zmdi zmdi-edit editDevBtn"></i>
                        </span>
                        <span class="more">
                            <i class="zmdi zmdi-delete deleteDevBtn"></i>
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
        console.log('Attaching event listeners');
        // Add click event listeners to all edit buttons
        document.querySelectorAll('.editDevBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('Edit button clicked');
                const row = btn.closest('tr');
                const id = row.getAttribute('data-id');
                const deviceType = row.closest('tbody').id === 'electricFenceTableBody' ? 'Electric Fence' : 'Camera';

                fetch(`/${deviceType === 'Electric Fence' ? 'electricFences' : 'cameras'}/${id}`)
                    .then(response => response.json())
                    .then(device => {
                        console.log('Device data fetched:', device);
                        document.getElementById('deviceName').textContent = device[deviceType === 'Electric Fence' ? 'efName' : 'camName'];
                        document.getElementById('deviceId').textContent = id;
                        document.getElementById('device-location').value = device[deviceType === 'Electric Fence' ? 'efLocation' : 'camLocation'];
                        document.getElementById('device-latitude').value = device[deviceType === 'Electric Fence' ? 'efLat' : 'camLat'];
                        document.getElementById('device-longitude').value = device[deviceType === 'Electric Fence' ? 'efLong' : 'camLong'];
                        document.querySelector(`input[name="status"][value="${device[deviceType === 'Electric Fence' ? 'efStat' : 'camStat']}"]`).checked = true;

                        modal.style.display = "block";
                    })
                    .catch(error => console.error('Error fetching device details:', error));
            });
        });

        // Add click event listeners to all delete buttons
        document.querySelectorAll('.deleteDevBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('Delete button clicked');
                const deviceRow = btn.closest('tr');
                const deviceId = deviceRow.getAttribute('data-id');
                const deviceName = deviceRow.querySelector('td:nth-child(2) h4').textContent;
                const deviceType = deviceRow.closest('tbody').id === 'electricFenceTableBody' ? 'Electric Fence' : 'Camera';

                // Show custom confirmation modal
                document.getElementById('confirmDeviceName').textContent = deviceName;
                document.getElementById('confirmDeviceId').textContent = deviceId;
                const deleteDevConfirmationModal = document.getElementById('deleteDevConfirmationModal');
                deleteDevConfirmationModal.style.display = 'block';

                // Confirm deletion
                document.getElementById('confirmDeleteDevBtn').addEventListener('click', function() {
                    fetch(`/deleteDevice`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: deviceId, type: deviceType })
                    })
                    .then(response => {
                        if (response.ok) {
                            deviceRow.remove();
                        } else {
                            alert('Failed to delete device');
                        }
                        deleteDevConfirmationModal.style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error deleting device:', error);
                        deleteDevConfirmationModal.style.display = 'none';
                    });
                });

                // Cancel deletion
                document.getElementById('cancelDeleteDevBtn').addEventListener('click', function() {
                    deleteDevConfirmationModal.style.display = 'none';
                });

                // Close the modal
                document.getElementById('closeDeleteDevConfirmationModal').addEventListener('click', function() {
                    deleteDevConfirmationModal.style.display = 'none';
                });
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
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Handle form submission
    document.getElementById('editDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const deviceId = document.getElementById('deviceId').textContent;
        const deviceLocation = document.getElementById('device-location').value;
        const deviceLatitude = document.getElementById('device-latitude').value;
        const deviceLongitude = document.getElementById('device-longitude').value;
        const deviceStatus = document.querySelector('input[name="status"]:checked').value;
        const deviceType = document.getElementById('deviceName').textContent.includes('Electric Fence') ? 'Electric Fence' : 'Camera';

        fetch(`/updateDevice`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: deviceId,
                location: deviceLocation,
                latitude: deviceLatitude,
                longitude: deviceLongitude,
                status: deviceStatus,
                type: deviceType
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Device updated successfully');
                modal.style.display = "none";
                location.reload(); // Reload the page to fetch updated data
            } else {
                alert('Failed to update device');
            }
        })
        .catch(error => console.error('Error updating device:', error));
    });
});
