document.addEventListener('DOMContentLoaded', () => {
    fetch('/electricFences')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('electricFenceTableBody');
            tableBody.innerHTML = '';

            data.forEach(fence => {
                const row = document.createElement('tr');
                row.setAttribute('data-name', fence.efName);
                row.setAttribute('data-id', fence.ef_id);
                row.setAttribute('data-location', fence.efLocation);
                row.setAttribute('data-lat', fence.efLat);
                row.setAttribute('data-long', fence.efLong);
                row.setAttribute('data-status', fence.efStat); // Assuming efStat is the status

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

            attachEventListeners();
        })
        .catch(error => console.error('Error fetching electric fences:', error));

    fetch('/cameras')
        .then(response => response.json())
        .then(cameras => {
            const cameraTableBody = document.getElementById('cameraTableBody');
            cameraTableBody.innerHTML = '';

            cameras.forEach(camera => {
                const row = document.createElement('tr');
                row.setAttribute('data-name', camera.camName);
                row.setAttribute('data-id', camera.cam_id);
                row.setAttribute('data-location', camera.camLocation);
                row.setAttribute('data-lat', camera.camLat);
                row.setAttribute('data-long', camera.camLong);
                row.setAttribute('data-status', camera.camStat); // Assuming camStat is the status

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

            attachEventListeners();
        })
        .catch(error => console.error('Error fetching cameras:', error));

    function attachEventListeners() {
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                var deviceRow = btn.closest('tr');
                var deviceId = deviceRow.getAttribute('data-id');
                var deviceName = deviceRow.getAttribute('data-name');
                var deviceLocation = deviceRow.getAttribute('data-location');
                var deviceLat = deviceRow.getAttribute('data-lat');
                var deviceLong = deviceRow.getAttribute('data-long');
                var deviceStatus = deviceRow.getAttribute('data-status');

                document.getElementById('editDeviceID').innerText = deviceId;
                document.getElementById('editDeviceName').innerText = deviceName;
                document.getElementById('device-location').value = deviceLocation;
                document.getElementById('device-latitude').value = deviceLat;
                document.getElementById('device-longitude').value = deviceLong;
                document.querySelector(`input[name="status"][value="${deviceStatus}"]`).checked = true;

                modal.style.display = "block";
            });
        });

        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                var deviceRow = btn.closest('tr');
                var deviceName = deviceRow.getAttribute('data-name');
                if (confirm("Confirm to delete " + deviceName)) {
                    deviceRow.remove();
                }
            });
        });
    }

    document.getElementById('editDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault();
    
        var deviceId = document.getElementById('editDeviceID').innerText;
        var deviceName = document.getElementById('editDeviceName').innerText;
        var deviceLocation = document.getElementById('device-location').value;
        var deviceLat = document.getElementById('device-latitude').value;
        var deviceLong = document.getElementById('device-longitude').value;
        var status = document.querySelector('input[name="status"]:checked').value;
    
        console.log('Data being sent for update:', {
            id: deviceId,
            name: deviceName,
            location: deviceLocation,
            latitude: deviceLat,
            longitude: deviceLong,
            status: status
        });
    
        var updatedData = {
            id: deviceId,
            name: deviceName,
            location: deviceLocation,
            latitude: deviceLat,
            longitude: deviceLong,
            status: status
        };
    
        fetch('/updateDevice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                var deviceRow = document.querySelector(`tr[data-id="${deviceId}"]`);
                deviceRow.querySelector('td:nth-child(3) p').innerText = deviceLocation;
                deviceRow.querySelector('td:nth-child(4) p').innerText = deviceLat;
                deviceRow.querySelector('td:nth-child(5) p').innerText = deviceLong;
                modal.style.display = "none";
            } else {
                alert('Failed to update device');
            }
        })
        .catch(error => console.error('Error updating device:', error));
    });
    
    

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
