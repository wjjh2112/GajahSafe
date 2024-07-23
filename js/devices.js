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

    // Fetch cameras data from the backend
    fetch('/cameras')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('cameraTableBody');
            tableBody.innerHTML = ''; // Clear any existing rows

            data.forEach(camera => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', camera.cam_id);
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
            console.error('Error fetching cameras:', error);
        });

    // Add event listeners for dynamically added edit and delete buttons
    function attachEventListeners() {
        document.querySelectorAll('.editBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const row = btn.closest('tr');
                const id = row.getAttribute('data-id');
                const name = row.getAttribute('data-name');
                const location = row.getAttribute('data-location');
                const lat = row.getAttribute('data-lat');
                const long = row.getAttribute('data-long');
                const status = row.getAttribute('data-status');

                document.getElementById('deviceName').innerText = name;
                document.getElementById('deviceId').innerText = id;
                document.getElementById('device-location').value = location;
                document.getElementById('device-latitude').value = lat;
                document.getElementById('device-longitude').value = long;
                document.querySelector(`input[name="status"][value="${status}"]`).checked = true;

                document.getElementById('editDeviceModal').style.display = 'block';
            });
        });

        document.querySelectorAll('.deleteBtn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const deviceRow = btn.closest('tr');
                const deviceName = deviceRow.getAttribute('data-name');
                if (confirm(`Confirm to delete ${deviceName}`)) {
                    deviceRow.remove();
                } else {
                    window.location.href = "devices.html";
                }
            });
        });
    }

    // Close modal
    const modal = document.getElementById('editDeviceModal');
    const closeEditDeviceModal = document.getElementById('closeEditDeviceModal');

    closeEditDeviceModal.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById('editDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const id = document.getElementById('deviceId').innerText;
        const updatedDevice = {
            ef_id: id,
            efLocation: document.getElementById('device-location').value,
            efLat: document.getElementById('device-latitude').value,
            efLong: document.getElementById('device-longitude').value,
            efStat: document.querySelector('input[name="status"]:checked').value
        };

        fetch(`/updateDevice/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDevice)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Device updated successfully');
                window.location.reload(); // Reload the page to see the changes
            } else {
                alert('Failed to update device');
            }
        })
        .catch(error => {
            console.error('Error updating device:', error);
        });
    });

    document.getElementById('addDeviceBtn').addEventListener('click', function() {
        window.location.href = 'addDevice.html';
    });
});
