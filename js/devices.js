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
                    <td><p>${fence.efLat}</p></td>
                    <td><p>${fence.efLong}</p></td>
                    <td class="text-center">
                        <span class="more">
                            <i class="zmdi zmdi-edit editBtn" data-id="${fence.ef_id}" data-type="Electric Fence"></i>
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
            cameras.forEach((camera, index) => {
                const row = document.createElement('tr');
                row.setAttribute('data-name', camera.camName);
                row.innerHTML = `
                    <td><div class="table-data__info"><p>${camera.cam_id}</p></div></td>
                    <td><div class="table-data__info"><h4>${camera.camName}</h4></div></td>
                    <td><p>${camera.camLocation}</p></td>
                    <td><p>${camera.camLat}</p></td>
                    <td><p>${camera.camLong}</p></td>
                    <td class="text-center">
                        <span class="more">
                            <i class="zmdi zmdi-edit editBtn" data-id="${camera.cam_id}" data-type="Camera"></i>
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
                const deviceId = this.getAttribute('data-id');
                const deviceType = this.getAttribute('data-type');

                fetch(`/getDevice?type=${deviceType}&id=${deviceId}`)
                    .then(response => response.json())
                    .then(device => {
                        document.getElementById('device-name-display').textContent = device[`${deviceType === 'Camera' ? 'camName' : 'efName'}`];
                        document.getElementById('device-id-display').textContent = device[`${deviceType === 'Camera' ? 'cam_id' : 'ef_id'}`];
                        document.getElementById('device-location').value = device[`${deviceType === 'Camera' ? 'camLocation' : 'efLocation'}`];
                        document.getElementById('device-latitude').value = device[`${deviceType === 'Camera' ? 'camLat' : 'efLat'}`];
                        document.getElementById('device-longitude').value = device[`${deviceType === 'Camera' ? 'camLong' : 'efLong'}`];
                        document.querySelector(`input[name="status"][value="${device[`${deviceType === 'Camera' ? 'camStat' : 'efStat'}`]}"]`).checked = true;
                        document.getElementById('editDeviceModal').style.display = "block";
                    })
                    .catch(error => {
                        console.error('Error fetching device details:', error);
                    });
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

    // Modal close logic
    var modal = document.getElementById("editDeviceModal");
    var closeEditDeviceModal = document.getElementById("closeEditDeviceModal");

    closeEditDeviceModal.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Form submit logic
    document.getElementById('editDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(this);
        const deviceId = document.getElementById('device-id-display').textContent;
        const deviceType = document.querySelector('.editBtn').getAttribute('data-type');
        
        fetch(`/updateDevice?type=${deviceType}&id=${deviceId}`, {
            method: 'POST',
            body: JSON.stringify({
                location: formData.get('device-location'),
                latitude: formData.get('device-latitude'),
                longitude: formData.get('device-longitude'),
                status: formData.get('status')
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            alert('Device updated successfully!');
            modal.style.display = "none";
            // Refresh the table or re-fetch the data
        })
        .catch(error => {
            console.error('Error updating device:', error);
        });
    });
});
